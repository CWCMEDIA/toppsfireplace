'use client'

import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Info, RefreshCw, RotateCcw, X, AlertCircle, CheckCircle } from 'lucide-react'

interface ChartDataPoint {
  date: string
  gross: number
  net: number
  count: number
}

interface AnalyticsData {
  chartData: ChartDataPoint[]
  totals: {
    gross: number
    net: number
    fees: number
    count: number
  }
  today: {
    gross: number
    net: number
    count: number
  }
  yesterday: {
    gross: number
    net: number
    count: number
  }
}

export default function StripeAnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(7)
  const [startDate, setStartDate] = useState<string | null>(null) // Filter from this date forward
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(true) // Show disclaimer overlay
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchAnalytics()
    
    // Auto-refresh every 60 seconds to catch new orders
    intervalRef.current = setInterval(() => {
      fetchAnalytics(true) // Silent refresh
    }, 60000) // 60 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [days, startDate])

  const fetchAnalytics = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)
      const params = new URLSearchParams({ days: days.toString() })
      if (startDate) {
        params.append('startDate', startDate)
      }
      const response = await fetch(`/api/admin/stripe-analytics?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store' // Always fetch fresh data from Stripe
      })

      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
        setLastUpdated(new Date())
      } else {
        setError('Failed to load analytics')
      }
    } catch (err) {
      setError('Error loading analytics')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    fetchAnalytics(false)
  }

  const handleResetView = () => {
    // Set start date to today to effectively show 0 (no data from today forward)
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
  }

  const handleClearFilter = () => {
    setStartDate(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-secondary-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-secondary-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-secondary-100 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-secondary-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-secondary-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-secondary-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <p className="text-secondary-600">{error || 'No data available'}</p>
      </div>
    )
  }

  const grossChange = data.yesterday.gross > 0
    ? ((data.today.gross - data.yesterday.gross) / data.yesterday.gross) * 100
    : data.today.gross > 0 ? 100 : 0

  const netChange = data.yesterday.net > 0
    ? ((data.today.net - data.yesterday.net) / data.yesterday.net) * 100
    : data.today.net > 0 ? 100 : 0

  return (
    <div className="mb-6 relative">
      {/* Small Disclaimer Overlay */}
      {showDisclaimer && (
        <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-5 border-2 border-yellow-200">
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-secondary-900 mb-2">Test Data Disclaimer</h4>
                <p className="text-sm text-secondary-700 mb-2">
                  This data was generated from test payments sent to test the checkout system. This data will be reset when the payment information is updated to live mode.
                </p>
                <div className="flex items-start space-x-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800">
                    <strong>Everything works correctly.</strong>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Header with Time Period Selector and Refresh */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary-800">Revenue Analytics</h3>
          {lastUpdated && (
            <p className="text-xs text-secondary-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              {isRefreshing && <span className="ml-2 text-primary-600">Refreshing...</span>}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {startDate && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-xs text-yellow-800">
                Filtered from {new Date(startDate).toLocaleDateString('en-GB')}
              </span>
              <button
                onClick={handleClearFilter}
                className="text-yellow-600 hover:text-yellow-800"
                title="Clear date filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <button
            onClick={handleResetView}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            title="Reset view to show data from today (effectively 0)"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset View</span>
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gross Volume Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-secondary-700">Gross volume</h4>
                <Info className="w-4 h-4 text-secondary-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-secondary-900 mb-1">
              {formatCurrency(data.today.gross)}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {grossChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={grossChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {grossChange >= 0 ? '+' : ''}{grossChange.toFixed(1)}%
              </span>
              <span className="text-secondary-500">vs yesterday</span>
            </div>
            <div className="text-xs text-secondary-500 mt-1">
              {formatCurrency(data.yesterday.gross)} previous period
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#64748B"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  tickFormatter={(value) => `£${(value / 1000).toFixed(0)}K`}
                  stroke="#64748B"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => formatDate(label)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="gross"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#grossGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-secondary-500">
            Updated {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Net Volume Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-secondary-700">Net volume</h4>
                <Info className="w-4 h-4 text-secondary-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-secondary-900 mb-1">
              {formatCurrency(data.today.net)}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {netChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={netChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {netChange >= 0 ? '+' : ''}{netChange.toFixed(1)}%
              </span>
              <span className="text-secondary-500">vs yesterday</span>
            </div>
            <div className="text-xs text-secondary-500 mt-1">
              {formatCurrency(data.yesterday.net)} previous period
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#64748B"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  tickFormatter={(value) => `£${(value / 1000).toFixed(0)}K`}
                  stroke="#64748B"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => formatDate(label)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#netGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-secondary-500">
            Updated {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-secondary-200">
          <div className="text-sm text-secondary-600 mb-1">Total Gross Volume</div>
          <div className="text-2xl font-bold text-secondary-900">
            {formatCurrency(data.totals.gross)}
          </div>
          <div className="text-xs text-secondary-500 mt-1">
            {data.totals.count} payments
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-secondary-200">
          <div className="text-sm text-secondary-600 mb-1">Total Net Volume</div>
          <div className="text-2xl font-bold text-secondary-900">
            {formatCurrency(data.totals.net)}
          </div>
          <div className="text-xs text-secondary-500 mt-1">
            After Stripe fees
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-secondary-200">
          <div className="text-sm text-secondary-600 mb-1">Total Fees</div>
          <div className="text-2xl font-bold text-secondary-900">
            {formatCurrency(data.totals.fees)}
          </div>
          <div className="text-xs text-secondary-500 mt-1">
            {((data.totals.fees / data.totals.gross) * 100).toFixed(2)}% of gross
          </div>
        </div>
      </div>
    </div>
  )
}


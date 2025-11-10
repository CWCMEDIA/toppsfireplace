import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'
import { withSecurity } from '@/lib/api-security'
import { secureErrorResponse, secureSuccessResponse } from '@/lib/security'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// GET - Fetch Stripe analytics data (gross volume, net volume)
async function handleGetAnalytics(request: NextRequest) {
  try {
    // Authentication is handled by withSecurity wrapper
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7') // Default to 7 days
    const startDateParam = searchParams.get('startDate') // Optional: filter from this date forward

    // Calculate date range
    const endDate = Math.floor(Date.now() / 1000) // Current timestamp
    let startDate = endDate - (days * 24 * 60 * 60) // days ago
    
    // If startDate param is provided, use that instead (for "reset view" feature)
    if (startDateParam) {
      const startDateObj = new Date(startDateParam)
      startDate = Math.floor(startDateObj.getTime() / 1000)
    }

    // Fetch charges from Stripe
    const charges = await stripe.charges.list({
      created: {
        gte: startDate,
        lte: endDate
      },
      limit: 100 // Stripe's max per page
    })

    // Get all charges (handle pagination if needed)
    let allCharges = charges.data
    let hasMore = charges.has_more
    let lastChargeId = charges.data[charges.data.length - 1]?.id

    while (hasMore && allCharges.length < 1000) { // Limit to 1000 charges max
      const moreCharges = await stripe.charges.list({
        created: {
          gte: startDate,
          lte: endDate
        },
        starting_after: lastChargeId,
        limit: 100
      })
      allCharges = [...allCharges, ...moreCharges.data]
      hasMore = moreCharges.has_more
      lastChargeId = moreCharges.data[moreCharges.data.length - 1]?.id
    }

    // Fetch balance transactions for net amounts
    const balanceTransactions = await Promise.all(
      allCharges
        .filter((charge): charge is typeof charge & { balance_transaction: NonNullable<typeof charge.balance_transaction> } => 
          !!charge.balance_transaction
        )
        .map(charge => {
          const balanceTransactionId = typeof charge.balance_transaction === 'string'
            ? charge.balance_transaction
            : charge.balance_transaction.id
          return stripe.balanceTransactions.retrieve(balanceTransactionId)
        })
    )

    // Group by date and calculate totals
    const dailyData: { [key: string]: { gross: number; net: number; count: number } } = {}

    allCharges.forEach((charge, index) => {
      const date = new Date(charge.created * 1000)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { gross: 0, net: 0, count: 0 }
      }

      dailyData[dateKey].gross += charge.amount / 100 // Convert from pence to pounds
      dailyData[dateKey].count += 1

      // Get net amount from balance transaction if available
      if (charge.balance_transaction) {
        const balanceTransactionId = typeof charge.balance_transaction === 'string'
          ? charge.balance_transaction
          : charge.balance_transaction.id
        
        const balanceTransaction = balanceTransactions.find(
          bt => bt.id === balanceTransactionId
        )

        if (balanceTransaction) {
          dailyData[dateKey].net += balanceTransaction.net / 100
        } else {
          // Fallback: estimate net (rough approximation)
          dailyData[dateKey].net += (charge.amount / 100) * 0.971 // ~2.9% fee estimate
        }
      } else {
        // Fallback: estimate net
        dailyData[dateKey].net += (charge.amount / 100) * 0.971
      }
    })

    // Convert to array and sort by date
    const chartData = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        gross: parseFloat(data.gross.toFixed(2)),
        net: parseFloat(data.net.toFixed(2)),
        count: data.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate totals
    const totalGross = allCharges.reduce((sum, charge) => sum + charge.amount / 100, 0)
    const totalNet = balanceTransactions.reduce((sum, bt) => sum + bt.net / 100, 0)
    const totalFees = totalGross - totalNet

    // Get today's data
    const today = new Date().toISOString().split('T')[0]
    const todayData = chartData.find(d => d.date === today) || { gross: 0, net: 0, count: 0 }

    // Get yesterday's data
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const yesterdayData = chartData.find(d => d.date === yesterday) || { gross: 0, net: 0, count: 0 }

    return secureSuccessResponse({
      chartData,
      totals: {
        gross: parseFloat(totalGross.toFixed(2)),
        net: parseFloat(totalNet.toFixed(2)),
        fees: parseFloat(totalFees.toFixed(2)),
        count: allCharges.length
      },
      today: {
        gross: todayData.gross,
        net: todayData.net,
        count: todayData.count
      },
      yesterday: {
        gross: yesterdayData.gross,
        net: yesterdayData.net,
        count: yesterdayData.count
      }
    })
  } catch (error: any) {
    console.error('Error fetching Stripe analytics:', error)
    return secureErrorResponse(
      process.env.NODE_ENV === 'production' 
        ? 'Failed to fetch analytics' 
        : error.message,
      500
    )
  }
}

export const GET = withSecurity(handleGetAnalytics, {
  requireAuth: true,
  rateLimit: { maxRequests: 60, windowMs: 60000 }, // 60 requests per minute
  requireHTTPS: true,
  validateOrigin: true
})


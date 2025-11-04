'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List, Eye, Heart, X } from 'lucide-react'
import Image from 'next/image'
import { GalleryItem } from '@/lib/types'

const categories = [
  { value: 'all', label: 'All Projects' },
  { value: 'limestone', label: 'Limestone' },
  { value: 'marble', label: 'Marble' },
  { value: 'granite', label: 'Granite' },
  { value: 'travertine', label: 'Travertine' },
  { value: 'electric', label: 'Electric' },
  { value: 'cast-iron', label: 'Cast Iron' },
]

const types = [
  { value: 'all', label: 'All Types' },
  { value: 'fireplace', label: 'Fireplaces' },
  { value: 'stove', label: 'Stoves' },
  { value: 'electric', label: 'Electric Fires' },
  { value: 'installation', label: 'Installations' },
]

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await fetch('/api/gallery')
        if (response.ok) {
          const data = await response.json()
          // Filter to only show active items
          setGalleryItems((data.gallery || []).filter((item: GalleryItem) => item.status === 'active'))
        }
      } catch (error) {
        console.error('Error fetching gallery items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryItems()
  }, [])

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesType = selectedType === 'all' || item.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-secondary-800 mb-4">Our Gallery</h1>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Explore our portfolio of completed fireplace installations and projects across Essex. 
              See the quality of our work and get inspiration for your own home.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects, locations..."
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="flex border border-secondary-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 hover:bg-secondary-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 hover:bg-secondary-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
        }>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`card group hover:scale-105 transition-transform duration-300 cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => {
                setSelectedItem(item)
                setSelectedImageIndex(0)
              }}
            >
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-1/3' : ''}`}>
                {item.images && item.images.length > 0 ? (
                  <div className={`relative ${
                    viewMode === 'list' ? 'h-48' : 'aspect-w-4 aspect-h-3 h-64'
                  }`}>
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className={`bg-gradient-to-br from-secondary-200 to-secondary-300 flex items-center justify-center ${
                    viewMode === 'list' ? 'h-48' : 'aspect-w-4 aspect-h-3 h-64'
                  }`}>
                    <span className="text-secondary-500 text-lg">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary-600 capitalize">{item.category}</span>
                  <span className="text-sm text-secondary-500">{item.year}</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-secondary-600 mb-4 text-sm">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-sm text-secondary-500">
                  <span>{item.location}</span>
                  <span className="capitalize">{item.type}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-800 mb-2">No projects found</h3>
            <p className="text-secondary-600">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="relative">
              {selectedItem.images && selectedItem.images.length > 0 ? (
                <div className="relative w-full h-96 bg-secondary-100">
                  <Image
                    src={selectedItem.images[selectedImageIndex]}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                  />
                  {selectedItem.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImageIndex((prev) => 
                            prev > 0 ? prev - 1 : selectedItem.images.length - 1
                          )
                        }}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
                      >
                        ←
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImageIndex((prev) => 
                            prev < selectedItem.images.length - 1 ? prev + 1 : 0
                          )
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
                      >
                        →
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {selectedItem.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedImageIndex(index)
                            }}
                            className={`w-2 h-2 rounded-full ${
                              index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-secondary-200 to-secondary-300 flex items-center justify-center">
                  <span className="text-secondary-500 text-lg">No Image</span>
                </div>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
              >
                <X className="w-5 h-5 text-secondary-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-primary-600 capitalize">{selectedItem.category}</span>
                <span className="text-sm text-secondary-500">{selectedItem.year}</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 mb-4">{selectedItem.title}</h2>
              <p className="text-secondary-600 mb-6">{selectedItem.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-secondary-700">Location:</span>
                  <p className="text-secondary-600">{selectedItem.location}</p>
                </div>
                <div>
                  <span className="font-medium text-secondary-700">Type:</span>
                  <p className="text-secondary-600 capitalize">{selectedItem.type}</p>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {selectedItem.images && selectedItem.images.length > 1 && (
                <div className="mt-6 pt-6 border-t border-secondary-200">
                  <h3 className="text-sm font-medium text-secondary-700 mb-3">All Images</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedItem.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                          index === selectedImageIndex ? 'border-primary-600' : 'border-transparent'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${selectedItem.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {selectedItem.videos && selectedItem.videos.length > 0 && (
                <div className="mt-6 pt-6 border-t border-secondary-200">
                  <h3 className="text-sm font-medium text-secondary-700 mb-3">Videos</h3>
                  <div className="space-y-4">
                    {selectedItem.videos.map((video, index) => (
                      <div key={index} className="rounded-lg overflow-hidden shadow-md">
                        <video
                          src={video}
                          controls
                          className="w-full h-auto"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

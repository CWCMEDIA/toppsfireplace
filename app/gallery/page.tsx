'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List, Eye, Heart } from 'lucide-react'

// Sample gallery data
const galleryItems = [
  {
    id: 1,
    title: 'Classic Limestone Installation',
    category: 'limestone',
    type: 'installation',
    image: '/api/placeholder/400/300',
    description: 'Beautiful limestone fireplace installation in a traditional Victorian home.',
    location: 'Benfleet, Essex',
    year: '2024',
  },
  {
    id: 2,
    title: 'Modern Marble Suite',
    category: 'marble',
    type: 'fireplace',
    image: '/api/placeholder/400/300',
    description: 'Contemporary marble electric fire suite with LED lighting.',
    location: 'Westcliff-on-Sea, Essex',
    year: '2024',
  },
  {
    id: 3,
    title: 'Rustic Granite Stove',
    category: 'granite',
    type: 'stove',
    image: '/api/placeholder/400/300',
    description: 'Heavy-duty granite wood burning stove in a country cottage.',
    location: 'Hockley, Essex',
    year: '2023',
  },
  {
    id: 4,
    title: 'Elegant Travertine Feature',
    category: 'travertine',
    type: 'fireplace',
    image: '/api/placeholder/400/300',
    description: 'Sophisticated travertine fireplace with natural stone texture.',
    location: 'Canvey Island, Essex',
    year: '2024',
  },
  {
    id: 5,
    title: 'Electric Fire Installation',
    category: 'electric',
    type: 'electric',
    image: '/api/placeholder/400/300',
    description: 'Modern electric fire installation with realistic flame effects.',
    location: 'Southend-on-Sea, Essex',
    year: '2024',
  },
  {
    id: 6,
    title: 'Cast Iron Stove Setup',
    category: 'cast-iron',
    type: 'stove',
    image: '/api/placeholder/400/300',
    description: 'Traditional cast iron wood burning stove installation.',
    location: 'Leigh-on-Sea, Essex',
    year: '2023',
  },
]

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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItem, setSelectedItem] = useState(null)

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesType = selectedType === 'all' || item.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

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
              onClick={() => setSelectedItem(item)}
            >
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-1/3' : ''}`}>
                <div className={`bg-gradient-to-br from-secondary-200 to-secondary-300 flex items-center justify-center ${
                  viewMode === 'list' ? 'h-48' : 'aspect-w-4 aspect-h-3 h-64'
                }`}>
                  <span className="text-secondary-500 text-lg">Project Image</span>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Heart className="w-4 h-4 text-secondary-600 hover:text-red-500 cursor-pointer transition-colors duration-200" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 bg-secondary-100">
                <div className="w-full h-64 bg-gradient-to-br from-secondary-200 to-secondary-300 flex items-center justify-center">
                  <span className="text-secondary-500 text-lg">Project Image</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
              >
                <Eye className="w-5 h-5 text-secondary-600" />
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
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

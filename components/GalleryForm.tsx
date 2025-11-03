'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Upload, Image as ImageIcon, Trash2 } from 'lucide-react'
import { GalleryItem } from '@/lib/types'
import toast from 'react-hot-toast'

interface GalleryFormProps {
  galleryItem?: GalleryItem | null
  onClose: () => void
  onSave: (galleryItem: Partial<GalleryItem>) => void
}

export default function GalleryForm({ galleryItem, onClose, onSave }: GalleryFormProps) {
  const [formData, setFormData] = useState({
    title: galleryItem?.title || '',
    category: galleryItem?.category || 'limestone',
    type: galleryItem?.type || 'installation',
    description: galleryItem?.description || '',
    location: galleryItem?.location || '',
    year: galleryItem?.year || new Date().getFullYear().toString(),
    status: galleryItem?.status || 'active'
  })

  const [images, setImages] = useState<string[]>(galleryItem?.images || [])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'gallery') // Use gallery folder instead of products

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          setImages(prev => [...prev, data.url])
          toast.success('Image uploaded successfully')
        } else {
          toast.error('Failed to upload image')
        }
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || !formData.category || !formData.type || !formData.description || !formData.location || !formData.year) {
      toast.error('Please fill in all required fields')
      return
    }

    const galleryData = {
      ...formData,
      images
    }

    onSave(galleryData)
  }

  const categories = [
    { value: 'limestone', label: 'Limestone' },
    { value: 'marble', label: 'Marble' },
    { value: 'granite', label: 'Granite' },
    { value: 'travertine', label: 'Travertine' },
    { value: 'electric', label: 'Electric' },
    { value: 'cast-iron', label: 'Cast Iron' },
  ]

  const types = [
    { value: 'fireplace', label: 'Fireplaces' },
    { value: 'stove', label: 'Stoves' },
    { value: 'electric', label: 'Electric Fires' },
    { value: 'installation', label: 'Installations' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-secondary-800">
              {galleryItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
            </h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Classic Limestone Installation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Benfleet, Essex"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Year *
              </label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the project, installation, or fireplace..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Gallery Images
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center space-x-2 px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-secondary-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{galleryItem ? 'Update Gallery Item' : 'Add Gallery Item'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}


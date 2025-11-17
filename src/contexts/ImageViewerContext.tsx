/**
 * ImageViewerContext
 *
 * Global context for managing image viewer state across the entire application.
 * Allows any component to open images in the lightbox viewer.
 */

'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { ImageViewer, ImageViewerImage } from '@/components/ui/ImageViewer'

interface ImageViewerContextValue {
  openImage: (image: string | ImageViewerImage, images?: (string | ImageViewerImage)[]) => void
  openImages: (images: (string | ImageViewerImage)[], initialIndex?: number) => void
  closeViewer: () => void
}

const ImageViewerContext = createContext<ImageViewerContextValue | undefined>(undefined)

interface ImageViewerProviderProps {
  children: ReactNode
}

export function ImageViewerProvider({ children }: ImageViewerProviderProps) {
  const [opened, setOpened] = useState(false)
  const [images, setImages] = useState<ImageViewerImage[]>([])
  const [initialIndex, setInitialIndex] = useState(0)

  /**
   * Open a single image or an image within a gallery
   * @param image - Single image URL or ImageViewerImage object
   * @param images - Optional array of all images (for gallery mode)
   */
  const openImage = (
    image: string | ImageViewerImage,
    images?: (string | ImageViewerImage)[]
  ) => {
    const normalizedImage: ImageViewerImage =
      typeof image === 'string' ? { url: image } : image

    if (images && images.length > 0) {
      // Gallery mode: find the index of the clicked image
      const normalizedImages: ImageViewerImage[] = images.map((img) =>
        typeof img === 'string' ? { url: img } : img
      )
      const index = normalizedImages.findIndex((img) => img.url === normalizedImage.url)
      setImages(normalizedImages)
      setInitialIndex(index >= 0 ? index : 0)
    } else {
      // Single image mode
      setImages([normalizedImage])
      setInitialIndex(0)
    }

    setOpened(true)
  }

  /**
   * Open multiple images starting at a specific index
   * @param images - Array of image URLs or ImageViewerImage objects
   * @param initialIndex - Index of the first image to display (default: 0)
   */
  const openImages = (images: (string | ImageViewerImage)[], initialIndex = 0) => {
    const normalizedImages: ImageViewerImage[] = images.map((img) =>
      typeof img === 'string' ? { url: img } : img
    )
    setImages(normalizedImages)
    setInitialIndex(Math.max(0, Math.min(initialIndex, normalizedImages.length - 1)))
    setOpened(true)
  }

  /**
   * Close the image viewer
   */
  const closeViewer = () => {
    setOpened(false)
  }

  return (
    <ImageViewerContext.Provider value={{ openImage, openImages, closeViewer }}>
      {children}
      <ImageViewer
        images={images}
        initialIndex={initialIndex}
        opened={opened}
        onClose={closeViewer}
      />
    </ImageViewerContext.Provider>
  )
}

/**
 * Hook to access image viewer functionality
 * @returns ImageViewerContextValue
 * @throws Error if used outside ImageViewerProvider
 */
export function useImageViewer() {
  const context = useContext(ImageViewerContext)
  if (!context) {
    throw new Error('useImageViewer must be used within ImageViewerProvider')
  }
  return context
}

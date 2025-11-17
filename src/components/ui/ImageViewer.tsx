/**
 * ImageViewer Component
 *
 * A beautiful lightbox/modal image viewer with navigation, zoom, and download features.
 * Works across the entire system through ImageViewerProvider.
 *
 * Features:
 * - Full-screen modal display
 * - Navigation between multiple images
 * - Zoom in/out
 * - Download image
 * - Keyboard navigation (arrow keys, ESC)
 * - Mobile-friendly touch gestures
 */

'use client'

import { Modal, Image, ActionIcon, Group, Text, Box, Stack } from '@mantine/core'
import { IconX, IconChevronLeft, IconChevronRight, IconZoomIn, IconZoomOut, IconDownload } from '@tabler/icons-react'
import { useState, useEffect } from 'react'

export interface ImageViewerImage {
  url: string
  title?: string
  description?: string
}

interface ImageViewerProps {
  images: ImageViewerImage[]
  initialIndex: number
  opened: boolean
  onClose: () => void
}

export function ImageViewer({ images, initialIndex, opened, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const currentImage = images[currentIndex]
  const hasMultipleImages = images.length > 1
  const hasValidImage = images.length > 0 && currentImage

  // Reset zoom and pan when image changes
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [currentIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!opened || !hasValidImage) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
        case '_':
          handleZoomOut()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [opened, currentIndex, images.length, hasValidImage])

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.25, 0.5)
      // Reset pan if zooming back to 1x or below
      if (newZoom <= 1) {
        setPan({ x: 0, y: 0 })
      }
      return newZoom
    })
  }

  const handleDoubleClick = () => {
    if (zoom > 1) {
      // Reset zoom and pan
      setZoom(1)
      setPan({ x: 0, y: 0 })
    } else {
      // Zoom in to 2x
      setZoom(2)
    }
  }

  // Drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return // Only allow dragging when zoomed in
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return
    const touch = e.touches[0]
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleDownload = async () => {
    if (!currentImage) return

    try {
      const response = await fetch(currentImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = currentImage.title || `image-${currentIndex + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }

  // Don't render modal if no valid images
  if (!hasValidImage) {
    return null
  }

  return (
    <Modal
      opened={opened && hasValidImage}
      onClose={onClose}
      size="100%"
      padding={0}
      withCloseButton={false}
      styles={{
        body: {
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
        },
        content: {
          backgroundColor: 'transparent',
        },
      }}
      centered
    >
      {/* Header */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
          padding: '1rem',
        }}
      >
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            {currentImage.title && (
              <Text c="white" fw={500} size="lg">
                {currentImage.title}
              </Text>
            )}
            {hasMultipleImages && (
              <Text c="gray.4" size="sm">
                {currentIndex + 1} / {images.length}
              </Text>
            )}
            {zoom > 1 && (
              <Text c="gray.4" size="xs" style={{ fontStyle: 'italic' }}>
                גרור כדי להזיז • Drag to pan
              </Text>
            )}
          </Stack>

          <Group gap="xs">
            {/* Zoom Controls */}
            <ActionIcon
              variant="subtle"
              color="white"
              size="lg"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <IconZoomOut size={20} />
            </ActionIcon>
            <Text c="white" size="sm" style={{ minWidth: '3rem', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </Text>
            <ActionIcon
              variant="subtle"
              color="white"
              size="lg"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <IconZoomIn size={20} />
            </ActionIcon>

            {/* Download */}
            <ActionIcon
              variant="subtle"
              color="white"
              size="lg"
              onClick={handleDownload}
            >
              <IconDownload size={20} />
            </ActionIcon>

            {/* Close */}
            <ActionIcon
              variant="subtle"
              color="white"
              size="lg"
              onClick={onClose}
            >
              <IconX size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Image Container */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          overflow: 'hidden',
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.title || `Image ${currentIndex + 1}`}
          fit="contain"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* Navigation Arrows */}
      {hasMultipleImages && (
        <>
          {currentIndex > 0 && (
            <ActionIcon
              variant="filled"
              color="white"
              size="xl"
              onClick={handlePrevious}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1000,
              }}
            >
              <IconChevronLeft size={24} />
            </ActionIcon>
          )}

          {currentIndex < images.length - 1 && (
            <ActionIcon
              variant="filled"
              color="white"
              size="xl"
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1000,
              }}
            >
              <IconChevronRight size={24} />
            </ActionIcon>
          )}
        </>
      )}

      {/* Footer with Description */}
      {currentImage.description && (
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            padding: '2rem 1rem 1rem',
          }}
        >
          <Text c="white" size="sm" ta="center">
            {currentImage.description}
          </Text>
        </Box>
      )}

      {/* Thumbnails */}
      {hasMultipleImages && images.length <= 10 && (
        <Box
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}
        >
          <Group gap="xs">
            {images.map((img, idx) => (
              <Box
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: 60,
                  height: 60,
                  border: idx === currentIndex ? '2px solid white' : '2px solid transparent',
                  borderRadius: 4,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  opacity: idx === currentIndex ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                }}
              >
                <Image
                  src={img.url}
                  alt={img.title || `Thumbnail ${idx + 1}`}
                  fit="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            ))}
          </Group>
        </Box>
      )}
    </Modal>
  )
}

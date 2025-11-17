# Image Viewer System

## Overview

A beautiful, full-featured lightbox/modal image viewer system that works across the entire MoodB admin application. Instead of opening images in new tabs, images now open in an elegant full-screen viewer with navigation, zoom, and download capabilities.

## Features

### ✨ Core Features

1. **Full-Screen Modal Display**
   - Beautiful dark overlay (95% opacity)
   - Image centered and optimized for viewing
   - Gradient headers/footers for controls

2. **Navigation**
   - Previous/Next buttons for multiple images
   - Keyboard shortcuts (Arrow Left/Right)
   - Thumbnail strip (for galleries with ≤10 images)
   - Current index indicator (e.g., "2 / 5")

3. **Zoom Controls**
   - Zoom in/out buttons (+/- 25% increments)
   - Range: 50% to 300%
   - Keyboard shortcuts (+ and - keys)
   - Double-click to zoom (2x) or reset to 1x
   - Smooth transitions

4. **Pan/Drag Controls**
   - Drag to pan when zoomed in (zoom > 1x)
   - Mouse drag support (click and drag)
   - Touch support for mobile (single finger drag)
   - Auto-reset pan when zooming out to 1x
   - Visual cursor feedback (grab/grabbing)
   - Double-click to reset zoom and pan

5. **Download Images**
   - Download button in header
   - Downloads with proper filename

6. **Keyboard Shortcuts**
   - `←` Previous image
   - `→` Next image
   - `ESC` Close viewer
   - `+` or `=` Zoom in
   - `-` or `_` Zoom out
   - `Double-click` Toggle zoom (2x / 1x)

7. **Mobile-Friendly**
   - Touch-friendly controls
   - Touch drag support (single finger pan when zoomed)
   - Responsive layout
   - Proper sizing on all devices

8. **Image Metadata**
   - Title display
   - Description in footer
   - Image counter
   - Pan hint when zoomed in

9. **UX Enhancements**
   - Smooth hover effects on thumbnails (1.05x scale)
   - Transition animations
   - Dynamic cursor (zoom-in, grab, grabbing)
   - Loading states
   - Proper focus management
   - Visual feedback for drag state

---

## Architecture

### Files Created

```
src/
├── components/ui/
│   └── ImageViewer.tsx                    # Main viewer component
├── contexts/
│   └── ImageViewerContext.tsx             # Global state provider + hook
└── components/layouts/
    └── AdminLayout.tsx                    # Updated with provider
```

### Updated Files

```
src/app/[locale]/admin/
├── categories/[id]/page.tsx               # Category detail page
└── sub-categories/[id]/page.tsx           # Sub-category detail page
```

---

## Usage

### 1. Basic Usage (Already Integrated)

The ImageViewer is already integrated into the admin system for:
- Category detail pages
- Sub-category detail pages

Just click on any image thumbnail and the lightbox will open automatically!

### 2. Using in New Components

To add image viewer functionality to any component in the admin area:

```typescript
'use client'

import { useImageViewer } from '@/contexts/ImageViewerContext'

export function MyComponent() {
  const { openImage, openImages } = useImageViewer()

  // Option 1: Open a single image
  const handleImageClick = (imageUrl: string) => {
    openImage(imageUrl)
  }

  // Option 2: Open an image within a gallery
  const handleImageClick = (imageUrl: string, allImages: string[]) => {
    openImage(imageUrl, allImages)
  }

  // Option 3: Open multiple images starting at specific index
  const handleGalleryClick = (images: string[], startIndex: number) => {
    openImages(images, startIndex)
  }

  return (
    <div>
      {/* Example: Single image */}
      <img
        src={imageUrl}
        onClick={() => openImage(imageUrl)}
        style={{ cursor: 'pointer' }}
      />

      {/* Example: Gallery */}
      {images.map((url, idx) => (
        <img
          key={idx}
          src={url}
          onClick={() => openImage(url, images)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </div>
  )
}
```

### 3. Advanced Usage with Metadata

```typescript
import { useImageViewer } from '@/contexts/ImageViewerContext'
import type { ImageViewerImage } from '@/components/ui/ImageViewer'

export function GalleryComponent() {
  const { openImages } = useImageViewer()

  const handleClick = (index: number) => {
    const images: ImageViewerImage[] = [
      {
        url: 'https://example.com/image1.jpg',
        title: 'Renaissance Living Room',
        description: 'Elegant 16th-century Italian Renaissance interior with frescoes'
      },
      {
        url: 'https://example.com/image2.jpg',
        title: 'Baroque Palace Hall',
        description: 'Ornate baroque hall with gilded decorations'
      }
    ]

    openImages(images, index)
  }

  return (
    <div>
      {/* Your gallery UI */}
    </div>
  )
}
```

---

## API Reference

### `useImageViewer()` Hook

Returns an object with these methods:

#### `openImage(image, images?)`

Open a single image or an image within a gallery.

**Parameters:**
- `image`: `string | ImageViewerImage` - The image to display
- `images?`: `(string | ImageViewerImage)[]` - Optional array of all images (for gallery mode)

**Examples:**
```typescript
// Single image
openImage('https://example.com/image.jpg')

// Image with metadata
openImage({
  url: 'https://example.com/image.jpg',
  title: 'My Image',
  description: 'A beautiful image'
})

// Image within gallery
openImage('https://example.com/image2.jpg', [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg'
])
```

#### `openImages(images, initialIndex?)`

Open multiple images starting at a specific index.

**Parameters:**
- `images`: `(string | ImageViewerImage)[]` - Array of images
- `initialIndex?`: `number` - Index to start at (default: 0)

**Example:**
```typescript
openImages([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg'
], 1) // Start at second image
```

#### `closeViewer()`

Programmatically close the viewer (usually not needed - ESC key works).

**Example:**
```typescript
closeViewer()
```

---

### `ImageViewerImage` Type

```typescript
interface ImageViewerImage {
  url: string           // Required: Image URL
  title?: string        // Optional: Display title
  description?: string  // Optional: Display description
}
```

---

## Implementation Details

### 1. ImageViewer Component

Located at: `src/components/ui/ImageViewer.tsx`

**Features:**
- Full-screen modal using Mantine Modal
- Controlled component (opened, onClose props)
- Navigation arrows (previous/next)
- Zoom controls with percentage display
- Download functionality
- Keyboard event handling
- Thumbnail strip for galleries
- Title and description display
- Responsive grid layout

**Key Props:**
```typescript
interface ImageViewerProps {
  images: ImageViewerImage[]  // Array of images to display
  initialIndex: number         // Which image to show first
  opened: boolean              // Modal open state
  onClose: () => void          // Close handler
}
```

### 2. ImageViewerProvider & Context

Located at: `src/contexts/ImageViewerContext.tsx`

**Purpose:**
- Global state management for the viewer
- Provides `useImageViewer` hook
- Renders the `<ImageViewer />` component
- Handles image normalization (string → ImageViewerImage)

**Provider Setup:**
```typescript
export function ImageViewerProvider({ children }: ImageViewerProviderProps) {
  const [opened, setOpened] = useState(false)
  const [images, setImages] = useState<ImageViewerImage[]>([])
  const [initialIndex, setInitialIndex] = useState(0)

  // ... methods ...

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
```

### 3. Integration in AdminLayout

Located at: `src/components/layouts/AdminLayout.tsx`

The provider wraps all admin pages:

```typescript
<AppShell.Main>
  <ImageViewerProvider>
    <Container size="xl">{children}</Container>
  </ImageViewerProvider>
</AppShell.Main>
```

This makes the viewer available to **all admin pages** without additional setup.

---

## Styling & Customization

### Current Styling

- **Background**: `rgba(0, 0, 0, 0.95)` - Dark overlay
- **Header/Footer**: Gradient overlays for controls
- **Controls**: White semi-transparent buttons
- **Thumbnails**: 60x60px with 2px border for active image
- **Hover Effect**: 1.05x scale on thumbnails
- **Transitions**: 0.2s ease for smooth animations

### Customization

To customize the appearance, edit `src/components/ui/ImageViewer.tsx`:

```typescript
// Change modal background
styles={{
  body: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)', // Change opacity here
  }
}}

// Change control colors
<ActionIcon
  variant="subtle"
  color="white" // Change control color
  size="lg"
>

// Change thumbnail size
style={{
  width: 60,  // Change width
  height: 60, // Change height
}}
```

---

## Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| `←` | Previous image |
| `→` | Next image |
| `ESC` | Close viewer |
| `+` or `=` | Zoom in (+25%) |
| `-` or `_` | Zoom out (-25%) |
| `Double-click` | Toggle zoom (2x ↔ 1x) |

## Mouse/Touch Interactions

| Interaction | Action |
|-------------|--------|
| Click image thumbnail | Open viewer |
| Single click on image | Navigate (if multiple images) |
| Double-click on image | Toggle zoom (2x ↔ 1x) |
| Drag image (when zoomed) | Pan/move around |
| Click outside / ESC | Close viewer |
| Hover thumbnail | Scale 1.05x (preview) |

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

---

## Performance Considerations

1. **Lazy Loading**: Images are only loaded when viewer opens
2. **Efficient Re-renders**: Uses React best practices (memoization where needed)
3. **Event Cleanup**: Keyboard listeners are properly cleaned up
4. **Optimized Thumbnails**: Limited to 10 images to avoid performance issues

---

## Future Enhancements

Potential features for future versions:

- [ ] Pinch-to-zoom on mobile
- [ ] Image rotation controls
- [ ] Fullscreen API support
- [ ] Social sharing
- [ ] Image comparison (side-by-side)
- [ ] Image annotations
- [ ] Slideshow mode with auto-advance
- [ ] EXIF data display
- [ ] Print functionality

---

## Troubleshooting

### Issue: Images not opening in viewer

**Check:**
1. Is the component within `<ImageViewerProvider>`?
2. Are you using the `useImageViewer` hook correctly?
3. Check browser console for errors

**Solution:**
```typescript
// Make sure you're calling the hook at component level
const { openImage } = useImageViewer() // ✅ Correct

// Not inside a function
function handleClick() {
  const { openImage } = useImageViewer() // ❌ Wrong
}
```

### Issue: Keyboard shortcuts not working

**Cause**: Modal may not have focus

**Solution**: The viewer automatically handles focus. If issues persist, check if another component is capturing keyboard events.

### Issue: Images too large/small

**Solution**: The viewer automatically scales images to fit. To adjust, modify the zoom controls or default zoom level in `ImageViewer.tsx`.

---

## Testing

To test the image viewer:

1. Navigate to any category with images:
   - `http://localhost:3000/he/admin/categories/[id]`

2. Navigate to any sub-category with images:
   - `http://localhost:3000/he/admin/sub-categories/[id]`

3. Click on any image thumbnail

4. Test features:
   - Click arrows to navigate
   - Use keyboard shortcuts
   - Click zoom buttons
   - Click download button
   - Click thumbnails
   - Click outside or ESC to close

---

## Credits

Built with:
- **React** - Component framework
- **Mantine** - UI library (Modal, Image, ActionIcon, etc.)
- **Tabler Icons** - Icon library
- **TypeScript** - Type safety

---

## License

Part of the MoodB project.

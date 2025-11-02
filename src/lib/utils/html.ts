/**
 * HTML utility functions
 * Helpers for working with HTML content from rich text editors
 */

/**
 * Checks if HTML string contains actual text content (not just empty tags)
 * Strips HTML tags and checks if there's meaningful text
 */
export function hasHtmlContent(html: string | undefined | null): boolean {
  if (!html) return false
  
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Get text content (strips all HTML tags)
  const textContent = tempDiv.textContent || tempDiv.innerText || ''
  
  // Check if there's actual text after trimming
  return textContent.trim().length > 0
}

/**
 * Strips HTML tags and returns plain text
 */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return ''
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return (tempDiv.textContent || tempDiv.innerText || '').trim()
}


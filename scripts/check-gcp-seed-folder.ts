/**
 * Check what's in the seed-generated folder in GCP
 */
import { listFilesInPath } from '../src/lib/storage/gcp-storage'

async function checkSeedFolder() {
  console.log('Checking styles/seed-generated/ folder in GCP...\n')

  const files = await listFilesInPath('styles/seed-generated/')

  console.log(`Found ${files.length} files:\n`)

  // Group by style name (extract from filename)
  const styleGroups: Record<string, string[]> = {}

  files.forEach((url) => {
    const filename = url.split('/').pop() || ''
    const match = filename.match(/^\d+-[a-f0-9]+-(.+)-\d+\.png$/)
    if (match) {
      const styleName = match[1]
      if (!styleGroups[styleName]) {
        styleGroups[styleName] = []
      }
      styleGroups[styleName].push(url)
    }
  })

  Object.entries(styleGroups).forEach(([style, urls]) => {
    console.log(`📦 ${style}: ${urls.length} images`)
    urls.forEach((url, i) => {
      console.log(`   ${i + 1}. ${url.split('/').pop()}`)
    })
    console.log('')
  })

  console.log(`\n📊 Total: ${files.length} files across ${Object.keys(styleGroups).length} styles`)
}

checkSeedFolder().catch(console.error)

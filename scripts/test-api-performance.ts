/**
 * Test API Performance
 * Compare full vs lite material categories endpoints
 */

async function testEndpoint(url: string, name: string) {
  const start = Date.now()
  try {
    const response = await fetch(url)
    const data = await response.json()
    const duration = Date.now() - start

    console.log(`\n${name}:`)
    console.log(`  Status: ${response.status}`)
    console.log(`  Duration: ${duration}ms`)
    console.log(`  Categories: ${data.data?.length || 0}`)
    console.log(`  Data size: ${JSON.stringify(data).length} bytes`)

    return { duration, size: JSON.stringify(data).length }
  } catch (error) {
    console.error(`  Error: ${error}`)
    return { duration: -1, size: 0 }
  }
}

async function main() {
  console.log('Testing Material Categories API Performance...\n')
  console.log('='.repeat(60))

  const baseUrl = 'http://localhost:3001'

  // Test full endpoint
  const full = await testEndpoint(
    `${baseUrl}/api/admin/material-categories`,
    'Full Endpoint (/api/admin/material-categories)'
  )

  // Test lite endpoint
  const lite = await testEndpoint(
    `${baseUrl}/api/admin/material-categories/lite`,
    'Lite Endpoint (/api/admin/material-categories/lite)'
  )

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\nPerformance Summary:')
  console.log(`  Speed improvement: ${Math.round((full.duration / lite.duration) * 100)}% faster`)
  console.log(`  Size reduction: ${Math.round((1 - lite.size / full.size) * 100)}% smaller`)
  console.log(`  Time saved: ${full.duration - lite.duration}ms`)
}

main()

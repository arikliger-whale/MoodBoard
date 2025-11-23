/**
 * Phase 2: Test Generation Flow
 *
 * Tests the complete Phase 2 implementation:
 * 1. Texture generation from material guidance
 * 2. Material close-up image generation
 * 3. Special images (composite + anchor)
 * 4. StyleImage categorization
 * 5. Texture entity linking
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPhase2Generation() {
  console.log('\n🧪 Phase 2: Generation Flow Test\n')
  console.log('=' .repeat(60))

  try {
    // Step 1: Check Texture Categories exist
    console.log('\n📋 Step 1: Verifying Texture Categories...')
    const textureCategories = await prisma.textureCategory.findMany({
      include: {
        types: true
      }
    })

    console.log(`   ✅ Found ${textureCategories.length} texture categories`)
    textureCategories.forEach(cat => {
      console.log(`      - ${cat.name.en} (${cat.types.length} types)`)
    })

    if (textureCategories.length === 0) {
      console.log('\n   ⚠️  No texture categories found! Run: npx tsx prisma/seed-textures.ts')
      return
    }

    // Step 2: Find a test style or create one
    console.log('\n📋 Step 2: Finding test style...')

    // MongoDB doesn't support path queries like Postgres
    // Just find any style
    let testStyle = await prisma.style.findFirst({
      include: {
        subCategory: true,
        approach: true,
        color: true,
      }
    })

    if (!testStyle) {
      console.log('   ⚠️  No AI-generated styles found. Please run seed first.')
      console.log('   💡 Run: npm run seed:styles -- --limit 1')
      return
    }

    console.log(`   ✅ Using test style: ${testStyle.name.en}`)
    console.log(`      ID: ${testStyle.id}`)
    console.log(`      Price Level: ${testStyle.priceLevel || 'REGULAR'}`)

    // Step 3: Check StyleImages
    console.log('\n📋 Step 3: Checking StyleImages...')
    const styleImages = await prisma.styleImage.findMany({
      where: { styleId: testStyle.id }
    })

    console.log(`   ✅ Found ${styleImages.length} StyleImage records`)

    // Group by category
    const imagesByCategory = styleImages.reduce((acc, img) => {
      if (!acc[img.imageCategory]) acc[img.imageCategory] = []
      acc[img.imageCategory].push(img)
      return acc
    }, {} as Record<string, any[]>)

    Object.keys(imagesByCategory).forEach(category => {
      console.log(`      - ${category}: ${imagesByCategory[category].length} images`)
    })

    // Step 4: Check Texture Links
    console.log('\n📋 Step 4: Checking Texture Links...')
    const styleTextures = await prisma.styleTexture.findMany({
      where: { styleId: testStyle.id },
      include: {
        texture: {
          include: {
            category: true,
            type: true
          }
        }
      }
    })

    console.log(`   ✅ Found ${styleTextures.length} linked textures`)
    styleTextures.forEach(st => {
      console.log(`      - ${st.texture.name.en} (${st.texture.finish}) - usage: ${st.texture.usage}`)
    })

    // Step 5: Check Special Images
    console.log('\n📋 Step 5: Checking Special Images...')

    const compositeImage = await prisma.styleImage.findFirst({
      where: {
        styleId: testStyle.id,
        imageCategory: 'COMPOSITE'
      }
    })

    const anchorImage = await prisma.styleImage.findFirst({
      where: {
        styleId: testStyle.id,
        imageCategory: 'ANCHOR'
      }
    })

    console.log(`   Composite Image: ${compositeImage ? '✅ Found' : '❌ Missing'}`)
    if (compositeImage) {
      console.log(`      URL: ${compositeImage.url.substring(0, 60)}...`)
    }

    console.log(`   Anchor Image: ${anchorImage ? '✅ Found' : '❌ Missing'}`)
    if (anchorImage) {
      console.log(`      URL: ${anchorImage.url.substring(0, 60)}...`)
    }

    console.log(`   Style.compositeImageUrl: ${testStyle.compositeImageUrl ? '✅' : '❌'}`)
    console.log(`   Style.anchorImageUrl: ${testStyle.anchorImageUrl ? '✅' : '❌'}`)

    // Step 6: Check Material Images
    console.log('\n📋 Step 6: Checking Material Images...')
    const materialImages = await prisma.styleImage.findMany({
      where: {
        styleId: testStyle.id,
        imageCategory: 'MATERIAL'
      }
    })

    console.log(`   ✅ Found ${materialImages.length} material close-up images`)
    materialImages.forEach((img, idx) => {
      console.log(`      ${idx + 1}. ${img.description || 'No description'}`)
    })

    // Step 7: Check Room Images
    console.log('\n📋 Step 7: Checking Room Images...')
    const roomOverviewImages = await prisma.styleImage.findMany({
      where: {
        styleId: testStyle.id,
        imageCategory: 'ROOM_OVERVIEW'
      }
    })

    const roomDetailImages = await prisma.styleImage.findMany({
      where: {
        styleId: testStyle.id,
        imageCategory: 'ROOM_DETAIL'
      }
    })

    console.log(`   ROOM_OVERVIEW: ${roomOverviewImages.length} images`)
    console.log(`   ROOM_DETAIL: ${roomDetailImages.length} images`)

    // Get unique room types
    const roomTypes = new Set([
      ...roomOverviewImages.map(img => img.roomType),
      ...roomDetailImages.map(img => img.roomType)
    ])
    console.log(`   Unique room types: ${roomTypes.size}`)

    // Step 8: Verify Data Consistency
    console.log('\n📋 Step 8: Verifying Data Consistency...')

    const checks = {
      textureCategories: textureCategories.length >= 5,
      styleImages: styleImages.length > 0,
      textureLinks: styleTextures.length > 0,
      compositeImage: !!compositeImage,
      anchorImage: !!anchorImage,
      materialImages: materialImages.length > 0,
      roomImages: (roomOverviewImages.length + roomDetailImages.length) > 0,
    }

    const passed = Object.values(checks).filter(v => v).length
    const total = Object.keys(checks).length

    console.log(`\n   Checks Passed: ${passed}/${total}`)
    Object.entries(checks).forEach(([check, result]) => {
      console.log(`      ${result ? '✅' : '❌'} ${check}`)
    })

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 PHASE 2 TEST SUMMARY')
    console.log('='.repeat(60))

    console.log(`\nTest Style: ${testStyle.name.en}`)
    console.log(`Price Level: ${testStyle.priceLevel || 'REGULAR'}`)
    console.log(`\nImage Breakdown:`)
    console.log(`   - Golden Scenes: ${testStyle.gallery?.length || 0}`)
    console.log(`   - Material Images: ${materialImages.length}`)
    console.log(`   - Texture Images: ${imagesByCategory['TEXTURE']?.length || 0}`)
    console.log(`   - Composite: ${compositeImage ? 1 : 0}`)
    console.log(`   - Anchor: ${anchorImage ? 1 : 0}`)
    console.log(`   - Room Overview: ${roomOverviewImages.length}`)
    console.log(`   - Room Detail: ${roomDetailImages.length}`)
    console.log(`   - Total StyleImages: ${styleImages.length}`)

    console.log(`\nTexture Entities:`)
    console.log(`   - Linked Textures: ${styleTextures.length}`)
    console.log(`   - Available Categories: ${textureCategories.length}`)

    console.log(`\nRoom Coverage:`)
    console.log(`   - Room Types: ${roomTypes.size}`)

    if (passed === total) {
      console.log('\n✅ All Phase 2 checks passed!')
    } else {
      console.log(`\n⚠️  ${total - passed} checks failed. Review implementation.`)
    }

    console.log('\n' + '='.repeat(60))

  } catch (error) {
    console.error('\n❌ Test failed with error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testPhase2Generation()
  .then(() => {
    console.log('\n✅ Test completed successfully\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })

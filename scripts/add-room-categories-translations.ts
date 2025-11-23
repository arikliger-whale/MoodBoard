/**
 * Add Hebrew translations for Room Categories section
 *
 * Usage: npx tsx scripts/add-room-categories-translations.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const translations = [
  // Table translations
  { key: 'admin.styleSystem.roomCategories.loading', he: 'טוען קטגוריות חדרים...', en: 'Loading room categories...' },
  { key: 'admin.styleSystem.roomCategories.error', he: 'שגיאה בטעינת קטגוריות חדרים', en: 'Error loading room categories' },
  { key: 'admin.styleSystem.roomCategories.search', he: 'חיפוש קטגוריות...', en: 'Search categories...' },
  { key: 'admin.styleSystem.roomCategories.showInactive', he: 'הצג לא פעילים', en: 'Show inactive' },
  { key: 'admin.styleSystem.roomCategories.create', he: 'צור קטגוריה חדשה', en: 'Create New Category' },
  { key: 'admin.styleSystem.roomCategories.noResults', he: 'לא נמצאו תוצאות', en: 'No results found' },
  { key: 'admin.styleSystem.roomCategories.empty', he: 'אין קטגוריות חדרים', en: 'No room categories' },
  { key: 'admin.styleSystem.roomCategories.tryDifferentSearch', he: 'נסה חיפוש אחר', en: 'Try a different search' },
  { key: 'admin.styleSystem.roomCategories.emptyDescription', he: 'צור את הקטגוריה הראשונה שלך כדי להתחיל', en: 'Create your first category to get started' },

  // Table headers
  { key: 'admin.styleSystem.roomCategories.name', he: 'שם', en: 'Name' },
  { key: 'admin.styleSystem.roomCategories.slug', he: 'מזהה', en: 'Slug' },
  { key: 'admin.styleSystem.roomCategories.roomTypes', he: 'סוגי חדרים', en: 'Room Types' },
  { key: 'admin.styleSystem.roomCategories.order', he: 'סדר', en: 'Order' },
  { key: 'admin.styleSystem.roomCategories.status', he: 'סטטוס', en: 'Status' },
  { key: 'admin.styleSystem.roomCategories.rooms', he: 'חדרים', en: 'rooms' },
  { key: 'admin.styleSystem.roomCategories.active', he: 'פעיל', en: 'Active' },
  { key: 'admin.styleSystem.roomCategories.inactive', he: 'לא פעיל', en: 'Inactive' },

  // Actions
  { key: 'admin.styleSystem.roomCategories.deactivate', he: 'השבת', en: 'Deactivate' },
  { key: 'admin.styleSystem.roomCategories.activate', he: 'הפעל', en: 'Activate' },
  { key: 'admin.styleSystem.roomCategories.editCategory', he: 'ערוך קטגוריה', en: 'Edit Category' },
  { key: 'admin.styleSystem.roomCategories.createCategory', he: 'צור קטגוריה', en: 'Create Category' },

  // Delete confirmation
  { key: 'admin.styleSystem.roomCategories.deleteConfirmTitle', he: 'מחק קטגוריה?', en: 'Delete Category?' },
  { key: 'admin.styleSystem.roomCategories.deleteConfirmMessage', he: 'האם אתה בטוח שברצונך למחוק קטגוריה זו? פעולה זו לא ניתנת לביטול.', en: 'Are you sure you want to delete this category? This action cannot be undone.' },

  // Form translations
  { key: 'admin.styleSystem.roomCategories.form.basicInfo', he: 'מידע בסיסי', en: 'Basic Information' },
  { key: 'admin.styleSystem.roomCategories.form.nameHe', he: 'שם בעברית', en: 'Name (Hebrew)' },
  { key: 'admin.styleSystem.roomCategories.form.nameHePlaceholder', he: 'לדוגמה: פרטי, ציבורי, מסחרי', en: 'e.g., Private, Public, Commercial' },
  { key: 'admin.styleSystem.roomCategories.form.nameEn', he: 'שם באנגלית', en: 'Name (English)' },
  { key: 'admin.styleSystem.roomCategories.form.nameEnPlaceholder', he: 'לדוגמה: Private, Public, Commercial', en: 'e.g., Private, Public, Commercial' },
  { key: 'admin.styleSystem.roomCategories.form.slug', he: 'מזהה (Slug)', en: 'Slug' },
  { key: 'admin.styleSystem.roomCategories.form.slugPlaceholder', he: 'לדוגמה: private, public, commercial', en: 'e.g., private, public, commercial' },
  { key: 'admin.styleSystem.roomCategories.form.icon', he: 'אייקון', en: 'Icon' },
  { key: 'admin.styleSystem.roomCategories.form.iconPlaceholder', he: 'לדוגמה: 🏠, 🏛️, 🏢', en: 'e.g., 🏠, 🏛️, 🏢' },
  { key: 'admin.styleSystem.roomCategories.form.order', he: 'סדר תצוגה', en: 'Display Order' },
  { key: 'admin.styleSystem.roomCategories.form.orderPlaceholder', he: '0, 1, 2, ...', en: '0, 1, 2, ...' },
  { key: 'admin.styleSystem.roomCategories.form.description', he: 'תיאור', en: 'Description' },
  { key: 'admin.styleSystem.roomCategories.form.descriptionHe', he: 'תיאור בעברית', en: 'Description (Hebrew)' },
  { key: 'admin.styleSystem.roomCategories.form.descriptionHePlaceholder', he: 'תיאור אופציונלי של הקטגוריה...', en: 'Optional description of the category...' },
  { key: 'admin.styleSystem.roomCategories.form.descriptionEn', he: 'תיאור באנגלית', en: 'Description (English)' },
  { key: 'admin.styleSystem.roomCategories.form.descriptionEnPlaceholder', he: 'תיאור אופציונלי של הקטגוריה...', en: 'Optional description of the category...' },
]

async function main() {
  console.log('🌐 Adding Room Categories translations...\n')

  try {
    let addedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const translation of translations) {
      try {
        // Check if translation already exists
        const existing = await prisma.translation.findUnique({
          where: { key: translation.key },
        })

        if (existing) {
          console.log(`⏭️  Skipped (exists): ${translation.key}`)
          skippedCount++
          continue
        }

        // Create the translation
        await prisma.translation.create({
          data: {
            key: translation.key,
            valueHe: translation.he,
            valueEn: translation.en,
          },
        })

        console.log(`✅ Added: ${translation.key}`)
        addedCount++
      } catch (error: any) {
        console.error(`❌ Failed to add ${translation.key}: ${error.message}`)
        errorCount++
      }
    }

    console.log('')
    console.log('📈 Summary:')
    console.log(`   ✅ Added: ${addedCount}`)
    console.log(`   ⏭️  Skipped: ${skippedCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📊 Total: ${translations.length}`)
    console.log('')

    if (errorCount === 0) {
      console.log('✅ All translations processed successfully!\n')
    } else {
      console.warn(`⚠️  Warning: ${errorCount} translations failed.\n`)
    }

  } catch (error: any) {
    console.error('❌ Failed to add translations:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run script
main()
  .then(() => {
    console.log('✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

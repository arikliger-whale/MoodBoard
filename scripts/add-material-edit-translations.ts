#!/usr/bin/env tsx
/**
 * Add Material Edit Page Translations
 * Adds Hebrew and English translations for the material edit page
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const translations = [
  // Edit Page Specific
  {
    key: 'admin.materials.edit.title',
    valueHe: 'ערוך חומר',
    valueEn: 'Edit Material',
  },
  {
    key: 'admin.materials.edit.readOnlyMaterial',
    valueHe: 'חומר לקריאה בלבד',
    valueEn: 'Read-Only Material',
  },
  {
    key: 'admin.materials.edit.readOnlyMessage',
    valueHe: 'זהו חומר גלובלי ולא ניתן לערוך אותו. ניתן לצפות בפרטים אך לא לבצע שינויים.',
    valueEn: 'This is a global material and cannot be edited. You can view its details but not make changes.',
  },
  {
    key: 'admin.materials.edit.validationErrors',
    valueHe: 'שגיאות אימות',
    valueEn: 'Validation Errors',
  },
  {
    key: 'admin.materials.edit.pleaseFixErrors',
    valueHe: 'אנא תקן את השגיאות הבאות:',
    valueEn: 'Please fix the following errors:',
  },
  {
    key: 'admin.materials.edit.errorMessage',
    valueHe: 'אירעה שגיאה בעדכון החומר',
    valueEn: 'An error occurred while updating the material',
  },
  {
    key: 'admin.materials.edit.submit',
    valueHe: 'עדכן חומר',
    valueEn: 'Update Material',
  },

  // Basic Info
  {
    key: 'admin.materials.edit.basicInfo',
    valueHe: 'מידע בסיסי',
    valueEn: 'Basic Information',
  },
  {
    key: 'admin.materials.edit.sku',
    valueHe: 'מק"ט',
    valueEn: 'SKU',
  },
  {
    key: 'admin.materials.edit.skuPlaceholder',
    valueHe: 'הזן מק"ט ייחודי',
    valueEn: 'Enter unique SKU',
  },
  {
    key: 'admin.materials.edit.category',
    valueHe: 'קטגוריה',
    valueEn: 'Category',
  },
  {
    key: 'admin.materials.edit.categoryPlaceholder',
    valueHe: 'בחר קטגוריה',
    valueEn: 'Select category',
  },
  {
    key: 'admin.materials.edit.nameHe',
    valueHe: 'שם (עברית)',
    valueEn: 'Name (Hebrew)',
  },
  {
    key: 'admin.materials.edit.nameHePlaceholder',
    valueHe: 'הזן שם בעברית',
    valueEn: 'Enter name in Hebrew',
  },
  {
    key: 'admin.materials.edit.nameEn',
    valueHe: 'שם (אנגלית)',
    valueEn: 'Name (English)',
  },
  {
    key: 'admin.materials.edit.nameEnPlaceholder',
    valueHe: 'הזן שם באנגלית',
    valueEn: 'Enter name in English',
  },

  // Properties
  {
    key: 'admin.materials.edit.properties',
    valueHe: 'מאפיינים',
    valueEn: 'Properties',
  },
  {
    key: 'admin.materials.edit.type',
    valueHe: 'סוג',
    valueEn: 'Type',
  },
  {
    key: 'admin.materials.edit.typePlaceholder',
    valueHe: 'בחר סוג',
    valueEn: 'Select type',
  },
  {
    key: 'admin.materials.edit.subType',
    valueHe: 'תת-סוג',
    valueEn: 'Sub-type',
  },
  {
    key: 'admin.materials.edit.subTypePlaceholder',
    valueHe: 'הזן תת-סוג',
    valueEn: 'Enter sub-type',
  },
  {
    key: 'admin.materials.edit.texture',
    valueHe: 'טקסטורה',
    valueEn: 'Texture',
  },
  {
    key: 'admin.materials.edit.texturePlaceholder',
    valueHe: 'הזן טקסטורה',
    valueEn: 'Enter texture',
  },
  {
    key: 'admin.materials.edit.colors',
    valueHe: 'צבעים',
    valueEn: 'Colors',
  },
  {
    key: 'admin.materials.edit.selectColors',
    valueHe: 'בחר צבעים',
    valueEn: 'Select colors',
  },
  {
    key: 'admin.materials.edit.finish',
    valueHe: 'גימור',
    valueEn: 'Finish',
  },
  {
    key: 'admin.materials.edit.addFinish',
    valueHe: 'הוסף גימור',
    valueEn: 'Add Finish',
  },
  {
    key: 'admin.materials.edit.finishPlaceholder',
    valueHe: 'הזן גימור',
    valueEn: 'Enter finish',
  },
  {
    key: 'admin.materials.edit.durability',
    valueHe: 'עמידות (1-10)',
    valueEn: 'Durability (1-10)',
  },
  {
    key: 'admin.materials.edit.maintenance',
    valueHe: 'תחזוקה (1-10)',
    valueEn: 'Maintenance (1-10)',
  },
  {
    key: 'admin.materials.edit.sustainability',
    valueHe: 'קיימות (1-10)',
    valueEn: 'Sustainability (1-10)',
  },
  {
    key: 'admin.materials.edit.dimensionUnit',
    valueHe: 'יחידת מידה',
    valueEn: 'Dimension Unit',
  },
  {
    key: 'admin.materials.edit.width',
    valueHe: 'רוחב',
    valueEn: 'Width',
  },
  {
    key: 'admin.materials.edit.widthPlaceholder',
    valueHe: 'הזן רוחב',
    valueEn: 'Enter width',
  },
  {
    key: 'admin.materials.edit.height',
    valueHe: 'גובה',
    valueEn: 'Height',
  },
  {
    key: 'admin.materials.edit.heightPlaceholder',
    valueHe: 'הזן גובה',
    valueEn: 'Enter height',
  },
  {
    key: 'admin.materials.edit.thickness',
    valueHe: 'עובי',
    valueEn: 'Thickness',
  },
  {
    key: 'admin.materials.edit.thicknessPlaceholder',
    valueHe: 'הזן עובי',
    valueEn: 'Enter thickness',
  },

  // Pricing
  {
    key: 'admin.materials.edit.pricing',
    valueHe: 'תמחור',
    valueEn: 'Pricing',
  },
  {
    key: 'admin.materials.edit.cost',
    valueHe: 'עלות',
    valueEn: 'Cost',
  },
  {
    key: 'admin.materials.edit.costPlaceholder',
    valueHe: 'הזן עלות',
    valueEn: 'Enter cost',
  },
  {
    key: 'admin.materials.edit.retail',
    valueHe: 'מחיר קמעונאי',
    valueEn: 'Retail Price',
  },
  {
    key: 'admin.materials.edit.retailPlaceholder',
    valueHe: 'הזן מחיר קמעונאי',
    valueEn: 'Enter retail price',
  },
  {
    key: 'admin.materials.edit.pricingUnit',
    valueHe: 'יחידת תמחור',
    valueEn: 'Pricing Unit',
  },
  {
    key: 'admin.materials.edit.currency',
    valueHe: 'מטבע',
    valueEn: 'Currency',
  },
  {
    key: 'admin.materials.edit.bulkDiscounts',
    valueHe: 'הנחות כמות',
    valueEn: 'Bulk Discounts',
  },
  {
    key: 'admin.materials.edit.addDiscount',
    valueHe: 'הוסף הנחה',
    valueEn: 'Add Discount',
  },
  {
    key: 'admin.materials.edit.minQuantity',
    valueHe: 'כמות מינימלית',
    valueEn: 'Minimum Quantity',
  },
  {
    key: 'admin.materials.edit.minQuantityPlaceholder',
    valueHe: 'הזן כמות מינימלית',
    valueEn: 'Enter minimum quantity',
  },
  {
    key: 'admin.materials.edit.discount',
    valueHe: 'הנחה (%)',
    valueEn: 'Discount (%)',
  },

  // Pricing Units
  {
    key: 'admin.materials.edit.pricingUnits.sqm',
    valueHe: 'מ"ר',
    valueEn: 'Square Meter',
  },
  {
    key: 'admin.materials.edit.pricingUnits.unit',
    valueHe: 'יחידה',
    valueEn: 'Unit',
  },
  {
    key: 'admin.materials.edit.pricingUnits.linearM',
    valueHe: 'מטר אורך',
    valueEn: 'Linear Meter',
  },

  // Availability
  {
    key: 'admin.materials.edit.availability',
    valueHe: 'זמינות',
    valueEn: 'Availability',
  },
  {
    key: 'admin.materials.edit.inStock',
    valueHe: 'במלאי',
    valueEn: 'In Stock',
  },
  {
    key: 'admin.materials.edit.leadTime',
    valueHe: 'זמן אספקה (ימים)',
    valueEn: 'Lead Time (days)',
  },
  {
    key: 'admin.materials.edit.leadTimePlaceholder',
    valueHe: 'הזן זמן אספקה',
    valueEn: 'Enter lead time',
  },
  {
    key: 'admin.materials.edit.minOrder',
    valueHe: 'הזמנה מינימלית',
    valueEn: 'Minimum Order',
  },
  {
    key: 'admin.materials.edit.minOrderPlaceholder',
    valueHe: 'הזן הזמנה מינימלית',
    valueEn: 'Enter minimum order',
  },

  // Image Gallery
  {
    key: 'admin.materials.edit.imageGallery',
    valueHe: 'גלריית תמונות',
    valueEn: 'Image Gallery',
  },
]

async function addTranslations() {
  console.log('🌍 Adding Material Edit Page Translations...\n')

  let addedCount = 0
  let skippedCount = 0
  let updatedCount = 0

  for (const translation of translations) {
    try {
      const existing = await prisma.translation.findUnique({
        where: { key: translation.key },
      })

      if (existing) {
        // Update existing translation
        await prisma.translation.update({
          where: { key: translation.key },
          data: {
            valueHe: translation.valueHe,
            valueEn: translation.valueEn,
          },
        })
        console.log(`✓ Updated: ${translation.key}`)
        updatedCount++
      } else {
        // Create new translation
        await prisma.translation.create({
          data: translation,
        })
        console.log(`+ Added: ${translation.key}`)
        addedCount++
      }
    } catch (error) {
      console.error(`✗ Error with ${translation.key}:`, error)
    }
  }

  console.log('\n📊 Summary:')
  console.log(`   Added: ${addedCount}`)
  console.log(`   Updated: ${updatedCount}`)
  console.log(`   Skipped: ${skippedCount}`)
  console.log(`   Total: ${translations.length}`)
  console.log('\n✅ Done!')
}

addTranslations()
  .catch((error) => {
    console.error('Error adding translations:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

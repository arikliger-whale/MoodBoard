/**
 * Zod Error Translator
 * Translates Zod validation errors to Hebrew
 */

import { ZodError } from 'zod'

interface TranslationMap {
  [key: string]: string
}

/**
 * Maps common Zod error messages to translation keys
 */
const errorTranslationMap: TranslationMap = {
  'Hebrew name is required': 'admin.materials.settings.categories.form.nameHeRequired',
  'English name is required': 'admin.materials.settings.categories.form.nameEnRequired',
  'Slug must be lowercase alphanumeric with hyphens': 'admin.materials.settings.categories.form.slugInvalid',
  'Category ID is required': 'admin.materials.settings.types.form.categoryRequired',
  'Invalid category ID format': 'admin.materials.settings.types.form.categoryInvalid',
  'At least one description (Hebrew or English) is required if description is provided': 'admin.materials.settings.categories.form.descriptionRequired',
  'Required': 'admin.materials.settings.categories.form.slugRequired',
  'Invalid': 'admin.materials.settings.categories.form.slugInvalid',
}

/**
 * Translates a Zod error message
 */
export function translateZodError(
  errorMessage: string,
  translations: (key: string) => string
): string {
  // Check if we have a translation key for this error
  const translationKey = errorTranslationMap[errorMessage]
  if (translationKey) {
    try {
      return translations(translationKey)
    } catch {
      // Fallback to original message if translation fails
      return errorMessage
    }
  }
  
  // Return original message if no translation found
  return errorMessage
}

/**
 * Translates all errors in a ZodError
 */
export function translateZodErrors(
  error: ZodError,
  translations: (key: string) => string
): Record<string, string> {
  const translatedErrors: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    const message = translateZodError(err.message, translations)
    translatedErrors[path] = message
  })
  
  return translatedErrors
}


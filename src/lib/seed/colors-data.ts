/**
 * Color Data for Seeding
 * Curated list of interior design colors with categories
 */

export interface ColorData {
  name: { he: string; en: string }
  hex: string
  pantone?: string
  category: 'neutral' | 'accent' | 'semantic' | 'metallic'
  role?: 'primary' | 'secondary'
  order: number
}

/**
 * All colors to be seeded
 * Organized by category
 */
export const COLORS_DATA: ColorData[] = [
  // Monochromatic Colors (Neutrals)
  { name: { he: 'לבן', en: 'White' }, hex: '#FFFFFF', category: 'neutral', order: 1 },
  { name: { he: 'לבן שבור', en: 'Off-White' }, hex: '#FAF9F6', category: 'neutral', order: 2 },
  { name: { he: 'קרם', en: 'Cream' }, hex: '#FFFDD0', category: 'neutral', order: 3 },
  { name: { he: 'בז\'', en: 'Beige' }, hex: '#F5F5DC', category: 'neutral', order: 4 },
  { name: { he: 'שמנת', en: 'Ivory' }, hex: '#FFFFF0', category: 'neutral', order: 5 },
  { name: { he: 'אופוויט', en: 'Eggshell' }, hex: '#F0EAD6', category: 'neutral', order: 6 },
  { name: { he: 'חום חם', en: 'Warm Brown' }, hex: '#594A42', category: 'neutral', order: 7 },
  { name: { he: 'אפור כהה', en: 'Dark Gray' }, hex: '#333333', category: 'neutral', order: 8 },
  { name: { he: 'שחור', en: 'Black' }, hex: '#000000', category: 'neutral', order: 9 },

  // Dominant Colors (Accent)
  { name: { he: 'כחול נייבי', en: 'Navy Blue' }, hex: '#000080', category: 'accent', role: 'primary', order: 10 },
  { name: { he: 'כחול', en: 'Blue' }, hex: '#0000FF', category: 'accent', role: 'primary', order: 11 },
  { name: { he: 'ירוק מרווה', en: 'Sage Green' }, hex: '#9CAF88', category: 'accent', order: 12 },
  { name: { he: 'ירוק בקבוק', en: 'Bottle Green' }, hex: '#006A4E', category: 'accent', order: 13 },
  { name: { he: 'בורדו', en: 'Burgundy' }, hex: '#800020', category: 'accent', order: 14 },
  { name: { he: 'ורוד עתיק', en: 'Antique Pink' }, hex: '#E8C4C4', category: 'accent', order: 15 },
  { name: { he: 'כאמל', en: 'Camel' }, hex: '#C19A6B', category: 'accent', order: 16 },
  { name: { he: 'טורקיז', en: 'Turquoise' }, hex: '#40E0D0', category: 'accent', order: 17 },

  // Metallic Colors
  { name: { he: 'זהב', en: 'Gold' }, hex: '#FFD700', category: 'metallic', order: 18 },
  { name: { he: 'זהב בהיר', en: 'Champagne Gold' }, hex: '#E4C07A', category: 'metallic', order: 19 },
  { name: { he: 'כסף', en: 'Silver' }, hex: '#C0C0C0', category: 'metallic', order: 20 },
  { name: { he: 'ברונזה', en: 'Bronze' }, hex: '#CD7F32', category: 'metallic', order: 21 },
  { name: { he: 'רוזגולד', en: 'Rose Gold' }, hex: '#B76E79', category: 'metallic', order: 22 },
  { name: { he: 'חלודה', en: 'Rust' }, hex: '#B7410E', category: 'metallic', order: 23 },
]

export function getColorsByCategory(category: ColorData['category']): ColorData[] {
  return COLORS_DATA.filter(color => color.category === category)
}

export function getColorByHex(hex: string): ColorData | undefined {
  return COLORS_DATA.find(color => color.hex.toLowerCase() === hex.toLowerCase())
}

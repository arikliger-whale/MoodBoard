/**
 * Category and Subcategory Data with Descriptions
 * Comprehensive design style catalog
 */

export const categoriesData = [
  {
    he: 'היסטוריים',
    en: 'Historical',
    slug: 'historical',
    descriptionHe: 'סגנונות עיצוב המבוססים על תקופות היסטוריות ותנועות אמנות קדומות, המעבירים את הקלאסיקה וההדר של עידנים שונים לחללים עכשוויים.',
    descriptionEn: 'Design styles based on historical periods and ancient art movements, bringing the classicism and grandeur of different eras into contemporary spaces.',
    order: 1,
    subcategories: [
      { he: 'מצרי עתיק', en: 'Ancient Egyptian', slug: 'ancient-egyptian', descriptionHe: 'מאופיין בסימטריה קשוחה, צבעים עמוקים וזהב, וציורי קיר בעלי אומנות גבוהה. משלב צורות גיאומטריות עם פסיגלי נחוש ודקורציות מלוכדות.', descriptionEn: 'Characterized by strict symmetry, deep colors and gold, and ornate hieroglyphic murals. Combines geometric forms with intricate bronze fixtures and hieroglyphic decorations.', order: 1 },
      { he: 'יווני קלאסי', en: 'Greek Classical', slug: 'greek-classical', descriptionHe: 'משלב עמודים יווניים קלאסיים, פרופורציות מושלמות, ודקורציות גיאומטריות. הדגש על הרמוניה, איזון ובעלי קצמות.', descriptionEn: 'Incorporates classical Greek columns, perfect proportions, and geometric decorations. Emphasis on harmony, balance, and majesty.', order: 2 },
      { he: 'רומי קלאסי', en: 'Classical Roman', slug: 'classical-roman', descriptionHe: 'הערות מרומא עתיקה עם עמודים יוניים, קשתות, וקורות חשופות. משלב קטטיות עתיקות, מוזאיקות וקישוטים מסובכים.', descriptionEn: 'Elements from ancient Rome with Corinthian columns, arches, and exposed beams. Incorporates ancient atriums, mosaics, and intricate ornaments.', order: 3 },
      { he: 'ביזנטי', en: 'Byzantine', slug: 'byzantine', descriptionHe: 'עשיר בזהב, קשמירים סגולים עמוקים, וציורי דקורציה מסובכים. משלב מוטיבים דתיים, קשתות עגולות, וכלים בעלי זהב.', descriptionEn: 'Rich in gold, deep purples, and intricate decorative paintings. Incorporates religious motifs, rounded arches, and golden ornaments.', order: 4 },
      { he: 'רומנסקי', en: 'Romanesque', slug: 'romanesque', descriptionHe: 'קשתות עגולות כבדות, קירות עבים, וקישוטים בעלי צורות בעלות חזק. צבעים כהים וחומרים דומי כמו אבן וקשת.', descriptionEn: 'Heavy rounded arches, thick walls, and strongly shaped ornaments. Dark colors and solid materials like stone and brick.', order: 5 },
      { he: 'גוטי', en: 'Gothic', slug: 'gothic', descriptionHe: 'קשתות מחודדות גבוהות, חלונות גדולים עם צבעוני, וקישוטים אנכיים דרמטיים. צבעים כהים, כסף, וחומרים דומים לתלאים.', descriptionEn: 'Pointed arches, large stained-glass windows, and dramatic vertical ornaments. Dark colors, silver, and materials similar to tapestries.', order: 6 },
      { he: 'רנסנס', en: 'Renaissance', slug: 'renaissance', descriptionHe: 'יצירת מחדש של אמנות קלאסית עם פרופורציות מושלמות ופרספקטיבה. משלב קצוות עגולות, תמונות מעונינות, וציורי קיר.', descriptionEn: 'Rebirth of classical art with perfect proportions and perspective. Incorporates rounded edges, frescoes, and mural paintings.', order: 7 },
      { he: 'בארוק', en: 'Baroque', slug: 'baroque', descriptionHe: 'דרמטי וקישוט בעודף עם עקומות מלחיכות, זהב רב, וצבעים עמוקים עמוקים. אנרגיה דרמטית וחיוניות בכל פנים.', descriptionEn: 'Dramatic and ornate with sweeping curves, abundant gold, and deep rich colors. Dramatic energy and vitality in every detail.', order: 8 },
      { he: 'רוקוקו', en: 'Rococo', slug: 'rococo', descriptionHe: 'עדין וקליל עם עקומות נשכות, מיניאטורות, וזהב בהיר. צבעים פסטליים, תבנית פרחונית, וקישוטים מעולפים.', descriptionEn: 'Delicate and light with flowing curves, miniatures, and bright gold. Pastel colors, floral patterns, and ornate decorations.', order: 9 },
      { he: 'לואי ה- 14', en: 'Louis XIV', slug: 'louis-xiv', descriptionHe: 'דוגמה לחיל ולתבר עם פסיגלי עתיקים, זהב בושפע, וחיוניות. משלב פרנסווט וטפסטריות בעלות דוגמות מלוכיות.', descriptionEn: 'Example of grandeur and splendor with ancient fixtures, abundant gold, and vitality. Incorporates Versailles-inspired elements and tapestries with royal patterns.', order: 10 },
      { he: 'לואי ה- 15', en: 'Louis XV', slug: 'louis-xv', descriptionHe: 'עדיף על רוקוקו עם רוקוקו משולבת, קישוטים דקים, וציירים של עדינות. משלב עקומות מלחיכות ודוגמות טבעיות רומנטיות.', descriptionEn: 'Refined Rococo with ornate decorations, delicate details, and painters of elegance. Incorporates sweeping curves and romantic natural patterns.', order: 11 },
      { he: 'לואי ה- 16', en: 'Louis XVI', slug: 'louis-xvi', descriptionHe: 'חזרה לניאו-קלאסיציזם עם סימטריה משופרת, קומות זהב, וגבוריות קשתות. משלב פשטות אלגנטית עם קישוטים מנומרים.', descriptionEn: 'Return to Neo-classicism with refined symmetry, golden tones, and tapered legs. Incorporates elegant simplicity with classical ornaments.', order: 12 },
    ]
  },
  // ... Additional categories data continues ...
]

/**
 * Enriched Category and Subcategory Seed Script
 * Seeds all categories and subcategories with enriched descriptions
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SubCategoryData {
  he: string
  en: string
  slug: string
  descriptionHe?: string
  descriptionEn?: string
  order: number
}

interface CategoryData {
  he: string
  en: string
  slug: string
  descriptionHe?: string
  descriptionEn?: string
  order: number
  subcategories: SubCategoryData[]
}

const categoriesData: CategoryData[] = [
  {
    he: 'היסטוריים',
    en: 'Historical',
    slug: 'historical',
    descriptionHe: 'סגנונות עיצוב המבוססים על תקופות היסטוריות ותנועות אמנות קדומות, המעבירים את הקלאסיקה וההדר של עידנים שונים לחללים עכשוויים. סגנונות אלה מציעים חיבור עמוק לעבר ונוכחות מלכותית ומרשימה.',
    descriptionEn: 'Design styles based on historical periods and ancient art movements, bringing the classicism and grandeur of different eras into contemporary spaces. These styles offer a deep connection to the past with royal and impressive presence.',
    order: 1,
    subcategories: [
      {
        he: 'מצרי עתיק',
        en: 'Ancient Egyptian',
        slug: 'ancient-egyptian',
        descriptionHe: 'מאופיין בסימטריה קשוחה, צבעים עמוקים וזהב, וציורי קיר בעלי אומנות גבוהה. משלב צורות גיאומטריות עם פסיגלי נחוש ודקורציות מלוכדות. סגנון המבוסס על המורשת המצרית העתיקה עם דגש על יוקרה ופולחן.',
        descriptionEn: 'Characterized by strict symmetry, deep colors and gold, and ornate hieroglyphic murals. Combines geometric forms with intricate bronze fixtures and hieroglyphic decorations. A style based on ancient Egyptian heritage with emphasis on luxury and ritual.',
        order: 1,
      },
      {
        he: 'יווני קלאסי',
        en: 'Greek Classical',
        slug: 'greek-classical',
        descriptionHe: 'משלב עמודים יווניים קלאסיים, פרופורציות מושלמות, ודקורציות גיאומטריות. הדגש על הרמוניה, איזון ובעלי קצמות. סגנון שמבוסס על האדריכלות היוונית העתיקה עם דגש על יופי מתמטי וקלאסי.',
        descriptionEn: 'Incorporates classical Greek columns, perfect proportions, and geometric decorations. Emphasis on harmony, balance, and majesty. A style based on ancient Greek architecture with emphasis on mathematical and classical beauty.',
        order: 2,
      },
      {
        he: 'רומי קלאסי',
        en: 'Classical Roman',
        slug: 'classical-roman',
        descriptionHe: 'הערות מרומא עתיקה עם עמודים יוניים, קשתות, וקורות חשופות. משלב קטטיות עתיקות, מוזאיקות וקישוטים מסובכים. סגנון המבוסס על האדריכלות הרומית עם דגש על עוצמה ופאר.',
        descriptionEn: 'Elements from ancient Rome with Corinthian columns, arches, and exposed beams. Incorporates ancient atriums, mosaics, and intricate ornaments. A style based on Roman architecture with emphasis on power and grandeur.',
        order: 3,
      },
      {
        he: 'ביזנטי',
        en: 'Byzantine',
        slug: 'byzantine',
        descriptionHe: 'עשיר בזהב, קשמירים סגולים עמוקים, וציורי דקורציה מסובכים. משלב מוטיבים דתיים, קשתות עגולות, וכלים בעלי זהב. סגנון המבוסס על האימפריה הביזנטית עם דגש על עושר דתי ואמנותי.',
        descriptionEn: 'Rich in gold, deep purples, and intricate decorative paintings. Incorporates religious motifs, rounded arches, and golden ornaments. A style based on the Byzantine Empire with emphasis on religious and artistic wealth.',
        order: 4,
      },
      {
        he: 'רומנסקי',
        en: 'Romanesque',
        slug: 'romanesque',
        descriptionHe: 'קשתות עגולות כבדות, קירות עבים, וקישוטים בעלי צורות בעלות חזק. צבעים כהים וחומרים דומי כמו אבן וקשת. סגנון המבוסס על האדריכלות הרומנסקית מימי הביניים עם דגש על חוזק ויציבות.',
        descriptionEn: 'Heavy rounded arches, thick walls, and strongly shaped ornaments. Dark colors and solid materials like stone and brick. A style based on Romanesque architecture from the Middle Ages with emphasis on strength and stability.',
        order: 5,
      },
      {
        he: 'גוטי',
        en: 'Gothic',
        slug: 'gothic',
        descriptionHe: 'קשתות מחודדות גבוהות, חלונות גדולים עם צבעוני, וקישוטים אנכיים דרמטיים. צבעים כהים, כסף, וחומרים דומים לתלאים. סגנון המבוסס על האדריכלות הגותית עם דגש על גובה ודרמה.',
        descriptionEn: 'Pointed arches, large stained-glass windows, and dramatic vertical ornaments. Dark colors, silver, and materials similar to tapestries. A style based on Gothic architecture with emphasis on height and drama.',
        order: 6,
      },
      {
        he: 'רנסנס',
        en: 'Renaissance',
        slug: 'renaissance',
        descriptionHe: 'יצירת מחדש של אמנות קלאסית עם פרופורציות מושלמות ופרספקטיבה. משלב קצוות עגולות, תמונות מעונינות, וציורי קיר. סגנון המבוסס על תקופת הרנסנס עם דגש על יופי קלאסי ואנושי.',
        descriptionEn: 'Rebirth of classical art with perfect proportions and perspective. Incorporates rounded edges, frescoes, and mural paintings. A style based on the Renaissance period with emphasis on classical and human beauty.',
        order: 7,
      },
      {
        he: 'בארוק',
        en: 'Baroque',
        slug: 'baroque',
        descriptionHe: 'דרמטי וקישוט בעודף עם עקומות מלחיכות, זהב רב, וצבעים עמוקים עמוקים. אנרגיה דרמטית וחיוניות בכל פנים. סגנון המבוסס על תקופת הבארוק עם דגש על תנועה ודרמה.',
        descriptionEn: 'Dramatic and ornate with sweeping curves, abundant gold, and deep rich colors. Dramatic energy and vitality in every detail. A style based on the Baroque period with emphasis on movement and drama.',
        order: 8,
      },
      {
        he: 'רוקוקו',
        en: 'Rococo',
        slug: 'rococo',
        descriptionHe: 'עדין וקליל עם עקומות נשכות, מיניאטורות, וזהב בהיר. צבעים פסטליים, תבנית פרחונית, וקישוטים מעולפים. סגנון המבוסס על תקופת הרוקוקו עם דגש על קלילות ועדינות.',
        descriptionEn: 'Delicate and light with flowing curves, miniatures, and bright gold. Pastel colors, floral patterns, and ornate decorations. A style based on the Rococo period with emphasis on lightness and delicacy.',
        order: 9,
      },
      {
        he: 'לואי ה-14',
        en: 'Louis XIV',
        slug: 'louis-xiv',
        descriptionHe: 'דוגמה לחיל ולתבר עם פסיגלי עתיקים, זהב בושפע, וחיוניות. משלב פרנסווט וטפסטריות בעלות דוגמות מלוכיות. סגנון המבוסס על תקופת לואי ה-14 עם דגש על פאר ומלוכה.',
        descriptionEn: 'Example of grandeur and splendor with ancient fixtures, abundant gold, and vitality. Incorporates Versailles-inspired elements and tapestries with royal patterns. A style based on the Louis XIV period with emphasis on grandeur and royalty.',
        order: 10,
      },
      {
        he: 'לואי ה-15',
        en: 'Louis XV',
        slug: 'louis-xv',
        descriptionHe: 'עדיף על רוקוקו עם רוקוקו משולבת, קישוטים דקים, וציירים של עדינות. משלב עקומות מלחיכות ודוגמות טבעיות רומנטיות. סגנון המבוסס על תקופת לואי ה-15 עם דגש על אלגנטיות ורומנטיקה.',
        descriptionEn: 'Refined Rococo with ornate decorations, delicate details, and painters of elegance. Incorporates sweeping curves and romantic natural patterns. A style based on the Louis XV period with emphasis on elegance and romance.',
        order: 11,
      },
      {
        he: 'לואי ה-16',
        en: 'Louis XVI',
        slug: 'louis-xvi',
        descriptionHe: 'חזרה לניאו-קלאסיציזם עם סימטריה משופרת, קומות זהב, וגבוריות קשתות. משלב פשטות אלגנטית עם קישוטים מנומרים. סגנון המבוסס על תקופת לואי ה-16 עם דגש על קלאסיות מעודנת.',
        descriptionEn: 'Return to Neo-classicism with refined symmetry, golden tones, and tapered legs. Incorporates elegant simplicity with classical ornaments. A style based on the Louis XVI period with emphasis on refined classicism.',
        order: 12,
      },
    ],
  },
  {
    he: 'מסורתיים ואזוריים – המאות 17–19',
    en: 'Traditional and Regional – 17th–19th Centuries',
    slug: 'traditional-regional-17-19',
    descriptionHe: 'סגנונות עיצוב מסורתיים ואזוריים מהמאות 17–19 המבוססים על תרבויות מקומיות ומורשת היסטורית. סגנונות אלה מציעים חיבור עמוק למקום ולזמן עם אסתטיקה קלאסית ומסורתית.',
    descriptionEn: 'Traditional and regional design styles from the 17th–19th centuries based on local cultures and historical heritage. These styles offer a deep connection to place and time with classical and traditional aesthetics.',
    order: 2,
    subcategories: [
      {
        he: 'קולוניאלי',
        en: 'Colonial',
        slug: 'colonial',
        descriptionHe: 'סגנון המבוסס על האדריכלות הקולוניאלית עם דגש על פשטות, פונקציונליות וחומרים טבעיים. משלב אלמנטים אירופיים עם השפעות מקומיות. סגנון המבוסס על תקופת הקולוניאליזם עם דגש על יעילות ונוחות.',
        descriptionEn: 'A style based on colonial architecture with emphasis on simplicity, functionality, and natural materials. Combines European elements with local influences. A style based on the colonial period with emphasis on efficiency and comfort.',
        order: 1,
      },
      {
        he: 'ים-תיכוני',
        en: 'Mediterranean',
        slug: 'mediterranean',
        descriptionHe: 'סגנון המבוסס על האדריכלות הים-תיכונית עם דגש על צבעים חמים, חומרים טבעיים ואווירה נינוחה. משלב אלמנטים מהתרבויות הים-תיכוניות השונות. סגנון המבוסס על התרבות הים-תיכונית עם דגש על אור ואווירה.',
        descriptionEn: 'A style based on Mediterranean architecture with emphasis on warm colors, natural materials, and relaxed atmosphere. Combines elements from various Mediterranean cultures. A style based on Mediterranean culture with emphasis on light and atmosphere.',
        order: 2,
      },
      {
        he: 'מזרחי',
        en: 'Oriental',
        slug: 'oriental',
        descriptionHe: 'סגנון המבוסס על האסתטיקה המזרחית עם דגש על אלמנטים דקורטיביים, צבעים עשירים ותבניות מורכבות. משלב השפעות מאסיה ומהמזרח התיכון. סגנון המבוסס על התרבות המזרחית עם דגש על יופי ופילוסופיה.',
        descriptionEn: 'A style based on Eastern aesthetics with emphasis on decorative elements, rich colors, and complex patterns. Combines influences from Asia and the Middle East. A style based on Eastern culture with emphasis on beauty and philosophy.',
        order: 3,
      },
      {
        he: 'הודי',
        en: 'Indian',
        slug: 'indian',
        descriptionHe: 'סגנון המבוסס על העיצוב ההודי המסורתי עם דגש על צבעים עזים, תבניות מורכבות ואלמנטים דקורטיביים עשירים. משלב השפעות מהתרבות ההודית העתיקה והמודרנית. סגנון המבוסס על התרבות ההודית עם דגש על שמחה וצבע.',
        descriptionEn: 'A style based on traditional Indian design with emphasis on vibrant colors, complex patterns, and rich decorative elements. Combines influences from ancient and modern Indian culture. A style based on Indian culture with emphasis on joy and color.',
        order: 4,
      },
      {
        he: 'טוסקני',
        en: 'Tuscan',
        slug: 'tuscan',
        descriptionHe: 'סגנון המבוסס על האדריכלות הטוסקנית עם דגש על אבן טבעית, צבעים חמים ואווירה כפרית. משלב אלמנטים מהאזור הטוסקני עם דגש על פשטות ויופי טבעי. סגנון המבוסס על תרבות טוסקנה עם דגש על איכות חיים.',
        descriptionEn: 'A style based on Tuscan architecture with emphasis on natural stone, warm colors, and rustic atmosphere. Combines elements from the Tuscan region with emphasis on simplicity and natural beauty. A style based on Tuscan culture with emphasis on quality of life.',
        order: 5,
      },
      {
        he: 'כפרי',
        en: 'Rustic',
        slug: 'rustic',
        descriptionHe: 'סגנון המבוסס על העיצוב הכפרי עם דגש על חומרים טבעיים, פשטות ואווירה חמימה. משלב אלמנטים מהחיים הכפריים עם דגש על נוחות ואותנטיות. סגנון המבוסס על החיים הכפריים עם דגש על טבע ופשטות.',
        descriptionEn: 'A style based on rustic design with emphasis on natural materials, simplicity, and warm atmosphere. Combines elements from rural life with emphasis on comfort and authenticity. A style based on rural life with emphasis on nature and simplicity.',
        order: 6,
      },
      {
        he: 'פרובנס',
        en: 'Provence',
        slug: 'provence',
        descriptionHe: 'סגנון המבוסס על העיצוב הפרובנסלי עם דגש על צבעים פסטליים, בדים קלים ואווירה רומנטית. משלב אלמנטים מהאזור הפרובנסלי עם דגש על יופי ונוחות. סגנון המבוסס על תרבות פרובנס עם דגש על חיים שלווים.',
        descriptionEn: 'A style based on Provençal design with emphasis on pastel colors, light fabrics, and romantic atmosphere. Combines elements from the Provence region with emphasis on beauty and comfort. A style based on Provence culture with emphasis on peaceful living.',
        order: 7,
      },
      {
        he: 'עתיק',
        en: 'Antique',
        slug: 'antique',
        descriptionHe: 'סגנון המבוסס על רהיטים וחפצים עתיקים עם דגש על איכות, עמידות ואותנטיות. משלב אלמנטים מהעבר עם דגש על מורשת והיסטוריה. סגנון המבוסס על חפצים עתיקים עם דגש על יופי נצחי.',
        descriptionEn: 'A style based on antique furniture and objects with emphasis on quality, durability, and authenticity. Combines elements from the past with emphasis on heritage and history. A style based on antiques with emphasis on timeless beauty.',
        order: 8,
      },
      {
        he: 'קלאסי',
        en: 'Classic',
        slug: 'classic',
        descriptionHe: 'סגנון המבוסס על העיצוב הקלאסי עם דגש על סימטריה, פרופורציות מושלמות ואלמנטים מסורתיים. משלב אלמנטים קלאסיים עם דגש על יופי נצחי. סגנון המבוסס על העיצוב הקלאסי עם דגש על אלגנטיות וזמן.',
        descriptionEn: 'A style based on classic design with emphasis on symmetry, perfect proportions, and traditional elements. Combines classical elements with emphasis on timeless beauty. A style based on classic design with emphasis on elegance and time.',
        order: 9,
      },
      {
        he: 'ניאו-קלאסי',
        en: 'Neo-Classical',
        slug: 'neo-classical',
        descriptionHe: 'סגנון המבוסס על החייאת העיצוב הקלאסי עם דגש על סימטריה, פרופורציות וקישוטים קלאסיים. משלב אלמנטים קלאסיים עם השפעות מודרניות. סגנון המבוסס על התחייה הקלאסית עם דגש על יופי מסודר.',
        descriptionEn: 'A style based on the revival of classical design with emphasis on symmetry, proportions, and classical ornaments. Combines classical elements with modern influences. A style based on classical revival with emphasis on ordered beauty.',
        order: 10,
      },
      {
        he: 'ויקטוריאני',
        en: 'Victorian',
        slug: 'victorian',
        descriptionHe: 'סגנון המבוסס על תקופת המלכה ויקטוריה עם דגש על קישוטים עשירים, צבעים כבדים ואלמנטים דקורטיביים. משלב אלמנטים מהתקופה הוויקטוריאנית עם דגש על פאר ועושר. סגנון המבוסס על תקופת ויקטוריה עם דגש על תשומת לב לפרטים.',
        descriptionEn: 'A style based on the Victorian era with emphasis on rich decorations, heavy colors, and decorative elements. Combines elements from the Victorian period with emphasis on grandeur and wealth. A style based on the Victorian era with emphasis on attention to detail.',
        order: 11,
      },
    ],
  },
  {
    he: 'מהפכה מודרנית – סוף המאה ה-19 ותחילת ה-20',
    en: 'Modern Revolution – Late 19th and Early 20th Century',
    slug: 'modern-revolution-late-19-early-20',
    descriptionHe: 'סגנונות עיצוב מהמהפכה המודרנית בסוף המאה ה-19 ותחילת ה-20 המבוססים על חדשנות, תעשייה ושבירת מוסכמות. סגנונות אלה מציעים חיבור לעתיד עם אסתטיקה חדשה ופורצת דרך.',
    descriptionEn: 'Design styles from the modern revolution in the late 19th and early 20th century based on innovation, industry, and breaking conventions. These styles offer a connection to the future with new and groundbreaking aesthetics.',
    order: 3,
    subcategories: [
      {
        he: 'אר-נובו',
        en: 'Art Nouveau',
        slug: 'art-nouveau',
        descriptionHe: 'סגנון המבוסס על תנועת האר-נובו עם דגש על קווים אורגניים, תבניות פרחוניות ואלמנטים דקורטיביים עשירים. משלב אלמנטים מהטבע עם דגש על יופי אורגני. סגנון המבוסס על תנועת האר-נובו עם דגש על תנועה וזרימה.',
        descriptionEn: 'A style based on the Art Nouveau movement with emphasis on organic lines, floral patterns, and rich decorative elements. Combines elements from nature with emphasis on organic beauty. A style based on the Art Nouveau movement with emphasis on movement and flow.',
        order: 1,
      },
      {
        he: 'אר-דקו',
        en: 'Art Deco',
        slug: 'art-deco',
        descriptionHe: 'סגנון המבוסס על תנועת האר-דקו עם דגש על גיאומטריה, צבעים עזים ואלמנטים דקורטיביים מודרניים. משלב אלמנטים מהתקופה המודרנית עם דגש על יופי גיאומטרי. סגנון המבוסס על תנועת האר-דקו עם דגש על אלגנטיות ומודרניות.',
        descriptionEn: 'A style based on the Art Deco movement with emphasis on geometry, bold colors, and modern decorative elements. Combines elements from the modern period with emphasis on geometric beauty. A style based on the Art Deco movement with emphasis on elegance and modernity.',
        order: 2,
      },
      {
        he: 'מודרני היסטורי (1920–1970)',
        en: 'Historical Modern (1920–1970)',
        slug: 'historical-modern-1920-1970',
        descriptionHe: 'סגנון המבוסס על העיצוב המודרני ההיסטורי משנות ה-20 עד ה-70 עם דגש על פונקציונליות, פשטות וחומרים תעשייתיים. משלב אלמנטים מהתקופה המודרנית עם דגש על יעילות. סגנון המבוסס על העיצוב המודרני ההיסטורי עם דגש על חדשנות.',
        descriptionEn: 'A style based on historical modern design from the 1920s to 1970s with emphasis on functionality, simplicity, and industrial materials. Combines elements from the modern period with emphasis on efficiency. A style based on historical modern design with emphasis on innovation.',
        order: 3,
      },
      {
        he: 'תעשייתי',
        en: 'Industrial',
        slug: 'industrial',
        descriptionHe: 'סגנון המבוסס על העיצוב התעשייתי עם דגש על חומרים גולמיים, מבנים חשופים ואלמנטים תעשייתיים. משלב אלמנטים מהעבר התעשייתי עם דגש על אותנטיות. סגנון המבוסס על העיצוב התעשייתי עם דגש על פשטות וכוח.',
        descriptionEn: 'A style based on industrial design with emphasis on raw materials, exposed structures, and industrial elements. Combines elements from the industrial past with emphasis on authenticity. A style based on industrial design with emphasis on simplicity and power.',
        order: 4,
      },
      {
        he: 'שנות ה-80',
        en: '1980s',
        slug: '1980s',
        descriptionHe: 'סגנון המבוסס על העיצוב משנות ה-80 עם דגש על צבעים עזים, צורות גיאומטריות ואלמנטים פוסט-מודרניים. משלב אלמנטים מהתקופה עם דגש על ביטוי אישי. סגנון המבוסס על שנות ה-80 עם דגש על חדשנות וביטוי.',
        descriptionEn: 'A style based on 1980s design with emphasis on bold colors, geometric shapes, and post-modern elements. Combines elements from the period with emphasis on personal expression. A style based on the 1980s with emphasis on innovation and expression.',
        order: 5,
      },
      {
        he: 'סוואג',
        en: 'Swag',
        slug: 'swag',
        descriptionHe: 'סגנון המבוסס על העיצוב הסוואגי עם דגש על יוקרה, אלגנטיות ואלמנטים דקורטיביים עשירים. משלב אלמנטים יוקרתיים עם דגש על נוחות. סגנון המבוסס על העיצוב הסוואגי עם דגש על עושר ונוחות.',
        descriptionEn: 'A style based on swag design with emphasis on luxury, elegance, and rich decorative elements. Combines luxurious elements with emphasis on comfort. A style based on swag design with emphasis on wealth and comfort.',
        order: 6,
      },
      {
        he: 'היפי',
        en: 'Hippie',
        slug: 'hippie',
        descriptionHe: 'סגנון המבוסס על העיצוב ההיפי עם דגש על צבעים עזים, תבניות פסיכדליות ואלמנטים טבעיים. משלב אלמנטים מהתרבות ההיפית עם דגש על חופש וביטוי. סגנון המבוסס על התרבות ההיפית עם דגש על אהבה ושלום.',
        descriptionEn: 'A style based on hippie design with emphasis on vibrant colors, psychedelic patterns, and natural elements. Combines elements from hippie culture with emphasis on freedom and expression. A style based on hippie culture with emphasis on love and peace.',
        order: 7,
      },
      {
        he: 'פאנק',
        en: 'Punk',
        slug: 'punk',
        descriptionHe: 'סגנון המבוסס על העיצוב הפאנקי עם דגש על מרד, אלמנטים גולמיים וביטוי אישי חזק. משלב אלמנטים מהתרבות הפאנקית עם דגש על אמירה. סגנון המבוסס על התרבות הפאנקית עם דגש על מרד וביטוי.',
        descriptionEn: 'A style based on punk design with emphasis on rebellion, raw elements, and strong personal expression. Combines elements from punk culture with emphasis on statement. A style based on punk culture with emphasis on rebellion and expression.',
        order: 8,
      },
    ],
  },
  {
    he: 'אמצע המאה ה-20 והלאה',
    en: 'Mid-20th Century and Beyond',
    slug: 'mid-20th-century-beyond',
    descriptionHe: 'סגנונות עיצוב מאמצע המאה ה-20 והלאה המבוססים על פונקציונליות, פשטות וחדשנות. סגנונות אלה מציעים חיבור לעתיד עם אסתטיקה מודרנית ומעודכנת.',
    descriptionEn: 'Design styles from the mid-20th century and beyond based on functionality, simplicity, and innovation. These styles offer a connection to the future with modern and updated aesthetics.',
    order: 4,
    subcategories: [
      {
        he: 'אמצע המאה (Mid-Century Modern)',
        en: 'Mid-Century Modern',
        slug: 'mid-century-modern',
        descriptionHe: 'סגנון המבוסס על העיצוב של אמצע המאה עם דגש על קווים נקיים, פונקציונליות וחומרים טבעיים. משלב אלמנטים מהתקופה עם דגש על פשטות ואלגנטיות. סגנון המבוסס על אמצע המאה עם דגש על יופי פונקציונלי.',
        descriptionEn: 'A style based on mid-century design with emphasis on clean lines, functionality, and natural materials. Combines elements from the period with emphasis on simplicity and elegance. A style based on mid-century with emphasis on functional beauty.',
        order: 1,
      },
      {
        he: 'רטרו',
        en: 'Retro',
        slug: 'retro',
        descriptionHe: 'סגנון המבוסס על העיצוב הרטרו עם דגש על חזרה לעבר עם השפעות מודרניות. משלב אלמנטים מהעבר עם דגש על נוסטלגיה. סגנון המבוסס על העיצוב הרטרו עם דגש על זיכרונות ויופי עבר.',
        descriptionEn: 'A style based on retro design with emphasis on returning to the past with modern influences. Combines elements from the past with emphasis on nostalgia. A style based on retro design with emphasis on memories and past beauty.',
        order: 2,
      },
      {
        he: 'וינטג',
        en: 'Vintage',
        slug: 'vintage',
        descriptionHe: 'סגנון המבוסס על העיצוב הוינטגי עם דגש על חפצים ישנים ואיכותיים מאיכות גבוהה. משלב אלמנטים מהעבר עם דגש על איכות ונצחיות. סגנון המבוסס על העיצוב הוינטגי עם דגש על יופי נצחי.',
        descriptionEn: 'A style based on vintage design with emphasis on old and high-quality objects. Combines elements from the past with emphasis on quality and timelessness. A style based on vintage design with emphasis on timeless beauty.',
        order: 3,
      },
      {
        he: 'פוסט-מודרני',
        en: 'Post-Modern',
        slug: 'post-modern',
        descriptionHe: 'סגנון המבוסס על העיצוב הפוסט-מודרני עם דגש על שבירת מוסכמות, אלמנטים מגוונים וביטוי אישי. משלב אלמנטים שונים עם דגש על חדשנות. סגנון המבוסס על העיצוב הפוסט-מודרני עם דגש על חופש ביטוי.',
        descriptionEn: 'A style based on post-modern design with emphasis on breaking conventions, diverse elements, and personal expression. Combines different elements with emphasis on innovation. A style based on post-modern design with emphasis on freedom of expression.',
        order: 4,
      },
      {
        he: 'פיוז\'ן',
        en: 'Fusion',
        slug: 'fusion',
        descriptionHe: 'סגנון המבוסס על עיצוב פיוז\'ן עם דגש על שילוב סגנונות שונים ויצירת משהו חדש. משלב אלמנטים מתרבויות שונות עם דגש על חדשנות. סגנון המבוסס על עיצוב פיוז\'ן עם דגש על יצירתיות.',
        descriptionEn: 'A style based on fusion design with emphasis on combining different styles and creating something new. Combines elements from different cultures with emphasis on innovation. A style based on fusion design with emphasis on creativity.',
        order: 5,
      },
      {
        he: 'אקללקטי',
        en: 'Eclectic',
        slug: 'eclectic',
        descriptionHe: 'סגנון המבוסס על העיצוב האקללקטי עם דגש על שילוב סגנונות שונים ואלמנטים מגוונים. משלב אלמנטים שונים עם דגש על ביטוי אישי. סגנון המבוסס על העיצוב האקללקטי עם דגש על חופש ויצירתיות.',
        descriptionEn: 'A style based on eclectic design with emphasis on combining different styles and diverse elements. Combines different elements with emphasis on personal expression. A style based on eclectic design with emphasis on freedom and creativity.',
        order: 6,
      },
      {
        he: 'על-זמן',
        en: 'Timeless',
        slug: 'timeless',
        descriptionHe: 'סגנון המבוסס על עיצוב על-זמן עם דגש על יופי נצחי, אלמנטים קלאסיים ואיכות. משלב אלמנטים נצחיים עם דגש על מורשת. סגנון המבוסס על עיצוב על-זמן עם דגש על יופי נצחי.',
        descriptionEn: 'A style based on timeless design with emphasis on eternal beauty, classical elements, and quality. Combines timeless elements with emphasis on heritage. A style based on timeless design with emphasis on eternal beauty.',
        order: 7,
      },
      {
        he: 'עכשוויי',
        en: 'Contemporary',
        slug: 'contemporary',
        descriptionHe: 'סגנון המבוסס על העיצוב העכשווי עם דגש על חדשנות, מודרניות ואלמנטים עדכניים. משלב אלמנטים מודרניים עם דגש על עתיד. סגנון המבוסס על העיצוב העכשווי עם דגש על חדשנות ורלוונטיות.',
        descriptionEn: 'A style based on contemporary design with emphasis on innovation, modernity, and updated elements. Combines modern elements with emphasis on the future. A style based on contemporary design with emphasis on innovation and relevance.',
        order: 8,
      },
    ],
  },
  {
    he: 'גל העיצוב החדש',
    en: 'New Design Wave',
    slug: 'new-design-wave',
    descriptionHe: 'סגנונות עיצוב מהגל החדש המבוססים על חדשנות, קיימות ומודעות עכשווית. סגנונות אלה מציעים חיבור לעתיד עם אסתטיקה חדשה ומודעת.',
    descriptionEn: 'Design styles from the new wave based on innovation, sustainability, and contemporary awareness. These styles offer a connection to the future with new and conscious aesthetics.',
    order: 5,
    subcategories: [
      {
        he: 'מודרני עכשוויי',
        en: 'Contemporary Modern',
        slug: 'contemporary-modern',
        descriptionHe: 'סגנון המבוסס על העיצוב המודרני העכשווי עם דגש על קווים נקיים, פונקציונליות וחומרים מודרניים. משלב אלמנטים מודרניים עם דגש על פשטות. סגנון המבוסס על העיצוב המודרני העכשווי עם דגש על יופי מינימליסטי.',
        descriptionEn: 'A style based on contemporary modern design with emphasis on clean lines, functionality, and modern materials. Combines modern elements with emphasis on simplicity. A style based on contemporary modern design with emphasis on minimalist beauty.',
        order: 1,
      },
      {
        he: 'מודרני קלאסי',
        en: 'Modern Classic',
        slug: 'modern-classic',
        descriptionHe: 'סגנון המבוסס על שילוב של מודרני וקלאסי עם דגש על אלגנטיות נצחית ואלמנטים מסורתיים. משלב אלמנטים קלאסיים עם השפעות מודרניות. סגנון המבוסס על מודרני קלאסי עם דגש על יופי נצחי.',
        descriptionEn: 'A style based on combining modern and classic with emphasis on timeless elegance and traditional elements. Combines classical elements with modern influences. A style based on modern classic with emphasis on timeless beauty.',
        order: 2,
      },
      {
        he: 'ניאו-קלאסי',
        en: 'Neo-Classical',
        slug: 'neo-classical-new',
        descriptionHe: 'סגנון המבוסס על החייאת העיצוב הקלאסי עם השפעות מודרניות. משלב אלמנטים קלאסיים עם דגש על עדכניות. סגנון המבוסס על ניאו-קלאסי עם דגש על יופי מסודר.',
        descriptionEn: 'A style based on reviving classical design with modern influences. Combines classical elements with emphasis on contemporaneity. A style based on neo-classical with emphasis on ordered beauty.',
        order: 3,
      },
      {
        he: 'סקנדינבי',
        en: 'Scandinavian',
        slug: 'scandinavian',
        descriptionHe: 'סגנון המבוסס על העיצוב הסקנדינבי עם דגש על פשטות, אור טבעי וחומרים טבעיים. משלב אלמנטים מהתרבות הסקנדינבית עם דגש על נוחות. סגנון המבוסס על העיצוב הסקנדינבי עם דגש על היגיינה ואיכות חיים.',
        descriptionEn: 'A style based on Scandinavian design with emphasis on simplicity, natural light, and natural materials. Combines elements from Scandinavian culture with emphasis on comfort. A style based on Scandinavian design with emphasis on hygiene and quality of life.',
        order: 4,
      },
      {
        he: 'יפני (זן)',
        en: 'Japanese (Zen)',
        slug: 'japanese-zen',
        descriptionHe: 'סגנון המבוסס על העיצוב היפני והפילוסופיה הזן עם דגש על מינימליזם, איזון ושלווה. משלב אלמנטים מהתרבות היפנית עם דגש על פשטות. סגנון המבוסס על העיצוב היפני עם דגש על הרמוניה ושלווה.',
        descriptionEn: 'A style based on Japanese design and Zen philosophy with emphasis on minimalism, balance, and tranquility. Combines elements from Japanese culture with emphasis on simplicity. A style based on Japanese design with emphasis on harmony and tranquility.',
        order: 5,
      },
      {
        he: 'ג\'יפנדי',
        en: 'Japandi',
        slug: 'japandi',
        descriptionHe: 'סגנון המבוסס על שילוב של יפני וסקנדינבי עם דגש על מינימליזם, פונקציונליות וחומרים טבעיים. משלב אלמנטים משני הסגנונות עם דגש על איזון. סגנון המבוסס על ג\'יפנדי עם דגש על יופי מינימליסטי ונוחות.',
        descriptionEn: 'A style based on combining Japanese and Scandinavian with emphasis on minimalism, functionality, and natural materials. Combines elements from both styles with emphasis on balance. A style based on Japandi with emphasis on minimalist beauty and comfort.',
        order: 6,
      },
      {
        he: 'אורבני',
        en: 'Urban',
        slug: 'urban',
        descriptionHe: 'סגנון המבוסס על העיצוב האורבני עם דגש על אלמנטים עירוניים, חומרים תעשייתיים ואווירה מודרנית. משלב אלמנטים מהעיר עם דגש על דינמיות. סגנון המבוסס על העיצוב האורבני עם דגש על אנרגיה וחדשנות.',
        descriptionEn: 'A style based on urban design with emphasis on urban elements, industrial materials, and modern atmosphere. Combines elements from the city with emphasis on dynamism. A style based on urban design with emphasis on energy and innovation.',
        order: 7,
      },
      {
        he: 'גולמי (Raw)',
        en: 'Raw',
        slug: 'raw',
        descriptionHe: 'סגנון המבוסס על עיצוב גולמי עם דגש על חומרים לא מעובדים, מבנים חשופים ואותנטיות. משלב אלמנטים גולמיים עם דגש על פשטות. סגנון המבוסס על עיצוב גולמי עם דגש על יופי טבעי.',
        descriptionEn: 'A style based on raw design with emphasis on unprocessed materials, exposed structures, and authenticity. Combines raw elements with emphasis on simplicity. A style based on raw design with emphasis on natural beauty.',
        order: 8,
      },
      {
        he: 'דקו-חדש',
        en: 'New Deco',
        slug: 'new-deco',
        descriptionHe: 'סגנון המבוסס על החייאת האר-דקו עם השפעות מודרניות. משלב אלמנטים מהאר-דקו עם דגש על עדכניות. סגנון המבוסס על דקו-חדש עם דגש על אלגנטיות מודרנית.',
        descriptionEn: 'A style based on reviving Art Deco with modern influences. Combines elements from Art Deco with emphasis on contemporaneity. A style based on new deco with emphasis on modern elegance.',
        order: 9,
      },
      {
        he: 'אקולוגי',
        en: 'Eco',
        slug: 'eco',
        descriptionHe: 'סגנון המבוסס על עיצוב אקולוגי עם דגש על קיימות, חומרים ממוחזרים ומודעות סביבתית. משלב אלמנטים אקולוגיים עם דגש על אחריות. סגנון המבוסס על עיצוב אקולוגי עם דגש על עתיד בר-קיימא.',
        descriptionEn: 'A style based on eco design with emphasis on sustainability, recycled materials, and environmental awareness. Combines ecological elements with emphasis on responsibility. A style based on eco design with emphasis on a sustainable future.',
        order: 10,
      },
      {
        he: 'חוף',
        en: 'Coastal',
        slug: 'coastal',
        descriptionHe: 'סגנון המבוסס על עיצוב חופי עם דגש על צבעים בהירים, חומרים טבעיים ואווירה נינוחה. משלב אלמנטים מהחוף עם דגש על נוחות. סגנון המבוסס על עיצוב חופי עם דגש על חיים שלווים.',
        descriptionEn: 'A style based on coastal design with emphasis on bright colors, natural materials, and relaxed atmosphere. Combines elements from the coast with emphasis on comfort. A style based on coastal design with emphasis on peaceful living.',
        order: 11,
      },
      {
        he: 'טרופי',
        en: 'Tropical',
        slug: 'tropical',
        descriptionHe: 'סגנון המבוסס על עיצוב טרופי עם דגש על צבעים עזים, תבניות טבעיות ואלמנטים אקזוטיים. משלב אלמנטים מהטרופיים עם דגש על שמחה. סגנון המבוסס על עיצוב טרופי עם דגש על חיים צבעוניים.',
        descriptionEn: 'A style based on tropical design with emphasis on vibrant colors, natural patterns, and exotic elements. Combines elements from the tropics with emphasis on joy. A style based on tropical design with emphasis on colorful living.',
        order: 12,
      },
      {
        he: 'אוסטרלי',
        en: 'Australian',
        slug: 'australian',
        descriptionHe: 'סגנון המבוסס על העיצוב האוסטרלי עם דגש על חומרים טבעיים, אווירה נינוחה ואלמנטים מקומיים. משלב אלמנטים מהתרבות האוסטרלית עם דגש על נוחות. סגנון המבוסס על העיצוב האוסטרלי עם דגש על חיים בטבע.',
        descriptionEn: 'A style based on Australian design with emphasis on natural materials, relaxed atmosphere, and local elements. Combines elements from Australian culture with emphasis on comfort. A style based on Australian design with emphasis on living in nature.',
        order: 13,
      },
      {
        he: 'קוסמופוליטי',
        en: 'Cosmopolitan',
        slug: 'cosmopolitan',
        descriptionHe: 'סגנון המבוסס על עיצוב קוסמופוליטי עם דגש על שילוב תרבויות, אלמנטים מגוונים ואווירה בינלאומית. משלב אלמנטים מתרבויות שונות עם דגש על פתיחות. סגנון המבוסס על עיצוב קוסמופוליטי עם דגש על גלובליות.',
        descriptionEn: 'A style based on cosmopolitan design with emphasis on combining cultures, diverse elements, and international atmosphere. Combines elements from different cultures with emphasis on openness. A style based on cosmopolitan design with emphasis on globality.',
        order: 14,
      },
      {
        he: 'בוהו שיק',
        en: 'Boho Chic',
        slug: 'boho-chic',
        descriptionHe: 'סגנון המבוסס על עיצוב בוהו שיק עם דגש על אלמנטים בוהמיים, תבניות מגוונות ואווירה חופשית. משלב אלמנטים בוהמיים עם דגש על ביטוי אישי. סגנון המבוסס על עיצוב בוהו שיק עם דגש על חופש ויצירתיות.',
        descriptionEn: 'A style based on boho chic design with emphasis on bohemian elements, diverse patterns, and free atmosphere. Combines bohemian elements with emphasis on personal expression. A style based on boho chic design with emphasis on freedom and creativity.',
        order: 15,
      },
      {
        he: 'סוריאליסטי',
        en: 'Surrealist',
        slug: 'surrealist',
        descriptionHe: 'סגנון המבוסס על העיצוב הסוריאליסטי עם דגש על אלמנטים דמיוניים, צורות לא שגרתיות וביטוי אמנותי. משלב אלמנטים סוריאליסטיים עם דגש על יצירתיות. סגנון המבוסס על העיצוב הסוריאליסטי עם דגש על דמיון ואמנות.',
        descriptionEn: 'A style based on surrealist design with emphasis on imaginative elements, unconventional shapes, and artistic expression. Combines surrealist elements with emphasis on creativity. A style based on surrealist design with emphasis on imagination and art.',
        order: 16,
      },
      {
        he: 'אלגנטי',
        en: 'Elegant',
        slug: 'elegant',
        descriptionHe: 'סגנון המבוסס על עיצוב אלגנטי עם דגש על יופי מעודן, איכות גבוהה ואלמנטים מסורתיים. משלב אלמנטים אלגנטיים עם דגש על זיכוך. סגנון המבוסס על עיצוב אלגנטי עם דגש על יופי נצחי.',
        descriptionEn: 'A style based on elegant design with emphasis on refined beauty, high quality, and traditional elements. Combines elegant elements with emphasis on refinement. A style based on elegant design with emphasis on timeless beauty.',
        order: 17,
      },
    ],
  },
]

async function seedCategories() {
  console.log('🌱 Starting category and subcategory seeding...')

  try {
    // Clear existing data (optional - comment out if you want to keep existing)
    // await prisma.subCategory.deleteMany({})
    // await prisma.category.deleteMany({})

    for (const categoryData of categoriesData) {
      console.log(`\n📁 Creating category: ${categoryData.en} (${categoryData.he})`)

      // Check if category already exists
      const existingCategory = await prisma.category.findUnique({
        where: { slug: categoryData.slug },
      })

      let category
      if (existingCategory) {
        console.log(`   ⚠️  Category already exists, updating...`)
        category = await prisma.category.update({
          where: { slug: categoryData.slug },
          data: {
            name: {
              he: categoryData.he,
              en: categoryData.en,
            },
            description: categoryData.descriptionHe || categoryData.descriptionEn
              ? {
                  he: categoryData.descriptionHe || '',
                  en: categoryData.descriptionEn || '',
                }
              : undefined,
            order: categoryData.order,
          },
        })
      } else {
        category = await prisma.category.create({
          data: {
            name: {
              he: categoryData.he,
              en: categoryData.en,
            },
            description: categoryData.descriptionHe || categoryData.descriptionEn
              ? {
                  he: categoryData.descriptionHe || '',
                  en: categoryData.descriptionEn || '',
                }
              : undefined,
            slug: categoryData.slug,
            order: categoryData.order,
          },
        })
      }

      console.log(`   ✅ Category created/updated: ${category.id}`)

      // Create subcategories
      for (const subCategoryData of categoryData.subcategories) {
        console.log(`   📄 Creating subcategory: ${subCategoryData.en} (${subCategoryData.he})`)

        // Check if subcategory already exists
        const existingSubCategory = await prisma.subCategory.findUnique({
          where: {
            categoryId_slug: {
              categoryId: category.id,
              slug: subCategoryData.slug,
            },
          },
        })

        if (existingSubCategory) {
          console.log(`      ⚠️  Subcategory already exists, updating...`)
          await prisma.subCategory.update({
            where: { id: existingSubCategory.id },
            data: {
              name: {
                he: subCategoryData.he,
                en: subCategoryData.en,
              },
              description: subCategoryData.descriptionHe || subCategoryData.descriptionEn
                ? {
                    he: subCategoryData.descriptionHe || '',
                    en: subCategoryData.descriptionEn || '',
                  }
                : undefined,
              order: subCategoryData.order,
            },
          })
        } else {
          await prisma.subCategory.create({
            data: {
              categoryId: category.id,
              name: {
                he: subCategoryData.he,
                en: subCategoryData.en,
              },
              description: subCategoryData.descriptionHe || subCategoryData.descriptionEn
                ? {
                    he: subCategoryData.descriptionHe || '',
                    en: subCategoryData.descriptionEn || '',
                  }
                : undefined,
              slug: subCategoryData.slug,
              order: subCategoryData.order,
            },
          })
        }
        console.log(`      ✅ Subcategory created/updated: ${subCategoryData.slug}`)
      }
    }

    console.log('\n✨ Seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Categories: ${categoriesData.length}`)
    console.log(
      `   - Subcategories: ${categoriesData.reduce((sum, cat) => sum + cat.subcategories.length, 0)}`
    )
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedCategories()
  .then(() => {
    console.log('✅ Seed script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error)
    process.exit(1)
  })


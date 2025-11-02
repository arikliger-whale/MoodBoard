/**
 * Material Categories and Types Seed Data
 * Comprehensive catalog of interior design materials
 */

export const materialCategoriesData = [
  {
    name: { he: 'ריצוף', en: 'Flooring' },
    description: {
      he: 'חומרי ריצוף לחדרים שונים - עץ, אריחים, שטיחים ועוד',
      en: 'Flooring materials for various rooms - wood, tiles, carpets and more',
    },
    slug: 'flooring',
    order: 1,
    icon: 'IconTiles',
    types: [
      {
        name: { he: 'פרקט עץ', en: 'Hardwood' },
        description: {
          he: 'ריצוף עץ טבעי - אלון, אשור, דובדבן ועוד',
          en: 'Natural wood flooring - oak, ash, cherry and more',
        },
        slug: 'hardwood',
        order: 1,
        icon: 'IconWood',
      },
      {
        name: { he: 'למינציה', en: 'Laminate' },
        description: {
          he: 'ריצוף למינציה דמוי עץ - עמיד וקל לתחזוקה',
          en: 'Wood-look laminate flooring - durable and easy to maintain',
        },
        slug: 'laminate',
        order: 2,
        icon: 'IconLayers',
      },
      {
        name: { he: 'אריחי קרמיקה', en: 'Ceramic Tiles' },
        description: {
          he: 'אריחי קרמיקה למטבח, חדר רחצה ואזורים רטובים',
          en: 'Ceramic tiles for kitchen, bathroom and wet areas',
        },
        slug: 'ceramic-tiles',
        order: 3,
        icon: 'IconTiles',
      },
      {
        name: { he: 'אריחי אבן', en: 'Stone Tiles' },
        description: {
          he: 'אריחי שיש, גרניט ואבן טבעית',
          en: 'Marble, granite and natural stone tiles',
        },
        slug: 'stone-tiles',
        order: 4,
        icon: 'IconMountain',
      },
      {
        name: { he: 'שטיח', en: 'Carpet' },
        description: {
          he: 'שטיחים ובדי ריצוף רכים',
          en: 'Carpets and soft floor coverings',
        },
        slug: 'carpet',
        order: 5,
        icon: 'IconColorSwatch',
      },
      {
        name: { he: 'ויניל', en: 'Vinyl' },
        description: {
          he: 'ריצוף ויניל - עמיד למים וקל להתקנה',
          en: 'Vinyl flooring - water resistant and easy to install',
        },
        slug: 'vinyl',
        order: 6,
        icon: 'IconBox',
      },
      {
        name: { he: 'בטון מצופה', en: 'Polished Concrete' },
        description: {
          he: 'בטון מצופה ומלוטש - סגנון תעשייתי מודרני',
          en: 'Polished and sealed concrete - modern industrial style',
        },
        slug: 'polished-concrete',
        order: 7,
        icon: 'IconBrick',
      },
    ],
  },
  {
    name: { he: 'כיסויי קירות', en: 'Wall Coverings' },
    description: {
      he: 'חומרים לכיסוי ועיצוב קירות - צבע, טפט, פאנלים ועוד',
      en: 'Materials for wall covering and design - paint, wallpaper, panels and more',
    },
    slug: 'wall-coverings',
    order: 2,
    icon: 'IconWall',
    types: [
      {
        name: { he: 'צבע', en: 'Paint' },
        description: {
          he: 'צבעי קיר - מט, מבריק, סט מט ועוד',
          en: 'Wall paints - matte, glossy, satin and more',
        },
        slug: 'paint',
        order: 1,
        icon: 'IconPaint',
      },
      {
        name: { he: 'טפט', en: 'Wallpaper' },
        description: {
          he: 'טפטים עם דוגמאות שונות - פרחוני, גיאומטרי, טקסטורה',
          en: 'Wallpapers with various patterns - floral, geometric, textured',
        },
        slug: 'wallpaper',
        order: 2,
        icon: 'IconColorSwatch',
      },
      {
        name: { he: 'אריחי קיר', en: 'Wall Tiles' },
        description: {
          he: 'אריחי קיר למטבח וחדר רחצה',
          en: 'Wall tiles for kitchen and bathroom',
        },
        slug: 'wall-tiles',
        order: 3,
        icon: 'IconTiles',
      },
      {
        name: { he: 'פאנלים', en: 'Panels' },
        description: {
          he: 'פאנלי עץ, PVC או MDF לקירות',
          en: 'Wood, PVC or MDF panels for walls',
        },
        slug: 'panels',
        order: 4,
        icon: 'IconLayout',
      },
      {
        name: { he: 'אבן קיר', en: 'Stone Cladding' },
        description: {
          he: 'כיסוי קיר באבן טבעית או מלאכותית',
          en: 'Natural or artificial stone wall cladding',
        },
        slug: 'stone-cladding',
        order: 5,
        icon: 'IconMountain',
      },
      {
        name: { he: 'טיח דקורטיבי', en: 'Decorative Plaster' },
        description: {
          he: 'טיחים דקורטיביים עם טקסטורות שונות',
          en: 'Decorative plasters with various textures',
        },
        slug: 'decorative-plaster',
        order: 6,
        icon: 'IconBrush',
      },
    ],
  },
  {
    name: { he: 'משטחי עבודה', en: 'Countertops' },
    description: {
      he: 'משטחי עבודה למטבח ולחדר רחצה',
      en: 'Countertops for kitchen and bathroom',
    },
    slug: 'countertops',
    order: 3,
    icon: 'IconTable',
    types: [
      {
        name: { he: 'גרניט', en: 'Granite' },
        description: {
          he: 'גרניט טבעי - עמיד וקלאסי',
          en: 'Natural granite - durable and classic',
        },
        slug: 'granite',
        order: 1,
        icon: 'IconMountain',
      },
      {
        name: { he: 'קווארץ', en: 'Quartz' },
        description: {
          he: 'קווארץ מהונדס - עמיד ללא תחזוקה',
          en: 'Engineered quartz - durable and maintenance-free',
        },
        slug: 'quartz',
        order: 2,
        icon: 'IconCube',
      },
      {
        name: { he: 'שיש', en: 'Marble' },
        description: {
          he: 'שיש טבעי - אלגנטי ויוקרתי',
          en: 'Natural marble - elegant and luxurious',
        },
        slug: 'marble',
        order: 3,
        icon: 'IconMountain',
      },
      {
        name: { he: 'קוריאן', en: 'Corian' },
        description: {
          he: 'קוריאן - משטח ללא תפרים',
          en: 'Corian - seamless surface',
        },
        slug: 'corian',
        order: 4,
        icon: 'IconCubeUnfolded',
      },
      {
        name: { he: 'בטון', en: 'Concrete' },
        description: {
          he: 'משטחי בטון מצופים - סגנון תעשייתי',
          en: 'Sealed concrete surfaces - industrial style',
        },
        slug: 'concrete-countertop',
        order: 5,
        icon: 'IconBrick',
      },
      {
        name: { he: 'עץ', en: 'Wood' },
        description: {
          he: 'משטחי עץ - חם וטבעי',
          en: 'Wood surfaces - warm and natural',
        },
        slug: 'wood-countertop',
        order: 6,
        icon: 'IconWood',
      },
      {
        name: { he: 'נירוסטה', en: 'Stainless Steel' },
        description: {
          he: 'משטחי נירוסטה - מודרני ותעשייתי',
          en: 'Stainless steel surfaces - modern and industrial',
        },
        slug: 'stainless-steel',
        order: 7,
        icon: 'IconTools',
      },
    ],
  },
  {
    name: { he: 'ארונות', en: 'Cabinetry' },
    description: {
      he: 'ארונות למטבח, חדר רחצה ולכל הבית',
      en: 'Cabinets for kitchen, bathroom and throughout the home',
    },
    slug: 'cabinetry',
    order: 4,
    icon: 'IconBoxes',
    types: [
      {
        name: { he: 'ארונות מטבח', en: 'Kitchen Cabinets' },
        description: {
          he: 'ארונות מטבח - בסיסיים ועליונים',
          en: 'Kitchen cabinets - base and wall units',
        },
        slug: 'kitchen-cabinets',
        order: 1,
        icon: 'IconBox',
      },
      {
        name: { he: 'ארונות חדר רחצה', en: 'Bathroom Vanities' },
        description: {
          he: 'ארונות אמבטיה וחדר רחצה',
          en: 'Bathroom vanities and storage',
        },
        slug: 'bathroom-vanities',
        order: 2,
        icon: 'IconBox',
      },
      {
        name: { he: 'ארונות מובנים', en: 'Built-in Cabinets' },
        description: {
          he: 'ארונות מובנים מותאמים אישית',
          en: 'Custom built-in cabinets',
        },
        slug: 'built-in-cabinets',
        order: 3,
        icon: 'IconBoxMultiple',
      },
      {
        name: { he: 'ארונות ספרייה', en: 'Bookcases' },
        description: {
          he: 'ארונות וספריות לאחסון ספרים',
          en: 'Bookcases and shelves for book storage',
        },
        slug: 'bookcases',
        order: 4,
        icon: 'IconStack',
      },
      {
        name: { he: 'ארונות בידור', en: 'Entertainment Centers' },
        description: {
          he: 'ארונות לטלוויזיה ומערכות בידור',
          en: 'Cabinets for TV and entertainment systems',
        },
        slug: 'entertainment-centers',
        order: 5,
        icon: 'IconDeviceDesktop',
      },
    ],
  },
  {
    name: { he: 'תאורה', en: 'Lighting' },
    description: {
      he: 'אביזרי תאורה לכל הבית',
      en: 'Lighting fixtures for the entire home',
    },
    slug: 'lighting',
    order: 5,
    icon: 'IconLamp',
    types: [
      {
        name: { he: 'תאורת תקרה', en: 'Ceiling Lights' },
        description: {
          he: 'נברשות, גופי תאורה תקרתיים ועוד',
          en: 'Chandeliers, ceiling fixtures and more',
        },
        slug: 'ceiling-lights',
        order: 1,
        icon: 'IconLamp',
      },
      {
        name: { he: 'תאורת קיר', en: 'Wall Lights' },
        description: {
          he: 'גופי תאורה קיריים - ברזלים, שרוולים ועוד',
          en: 'Wall-mounted fixtures - sconces, spotlights and more',
        },
        slug: 'wall-lights',
        order: 2,
        icon: 'IconLamp',
      },
      {
        name: { he: 'תאורת שולחן', en: 'Table Lamps' },
        description: {
          he: 'מנורות שולחן וקרמיקה',
          en: 'Table and desk lamps',
        },
        slug: 'table-lamps',
        order: 3,
        icon: 'IconLamp',
      },
      {
        name: { he: 'תאורת רצפה', en: 'Floor Lamps' },
        description: {
          he: 'מנורות רצפה ועמודים',
          en: 'Floor lamps and standing lights',
        },
        slug: 'floor-lamps',
        order: 4,
        icon: 'IconLamp',
      },
      {
        name: { he: 'תאורה משולבת', en: 'Recessed Lighting' },
        description: {
          he: 'תאורה מובנית בתקרה - ספוטים ודאונלייטים',
          en: 'Built-in ceiling lighting - spots and downlights',
        },
        slug: 'recessed-lighting',
        order: 5,
        icon: 'IconLamp',
      },
      {
        name: { he: 'תאורה חיצונית', en: 'Outdoor Lighting' },
        description: {
          he: 'תאורה לגינה ולחוץ',
          en: 'Garden and outdoor lighting',
        },
        slug: 'outdoor-lighting',
        order: 6,
        icon: 'IconSun',
      },
    ],
  },
  {
    name: { he: 'חומרה', en: 'Hardware' },
    description: {
      he: 'ידיות, צירים ואביזרי מתכת',
      en: 'Handles, hinges and metal accessories',
    },
    slug: 'hardware',
    order: 6,
    icon: 'IconTools',
    types: [
      {
        name: { he: 'ידיות דלתות', en: 'Door Handles' },
        description: {
          he: 'ידיות וכרטיסי דלתות',
          en: 'Door handles and knobs',
        },
        slug: 'door-handles',
        order: 1,
        icon: 'IconDoor',
      },
      {
        name: { he: 'ידיות ארונות', en: 'Cabinet Pulls' },
        description: {
          he: 'ידיות וכרטיסי ארונות',
          en: 'Cabinet handles and pulls',
        },
        slug: 'cabinet-pulls',
        order: 2,
        icon: 'IconBox',
      },
      {
        name: { he: 'צירים', en: 'Hinges' },
        description: {
          he: 'צירים לדלתות וארונות',
          en: 'Hinges for doors and cabinets',
        },
        slug: 'hinges',
        order: 3,
        icon: 'IconTools',
      },
      {
        name: { he: 'מנעולים', en: 'Locks' },
        description: {
          he: 'מנעולים ומנגנוני נעילה',
          en: 'Locks and locking mechanisms',
        },
        slug: 'locks',
        order: 4,
        icon: 'IconTools',
      },
      {
        name: { he: 'ברגים וניטים', en: 'Screws & Fasteners' },
        description: {
          he: 'ברגים, דיבלים ומוצרי חיבור',
          en: 'Screws, anchors and fastening products',
        },
        slug: 'screws-fasteners',
        order: 5,
        icon: 'IconTools',
      },
    ],
  },
  {
    name: { he: 'אביזרי אינסטלציה', en: 'Plumbing Fixtures' },
    description: {
      he: 'ברזים, כיורים ואביזרי אינסטלציה',
      en: 'Faucets, sinks and plumbing fixtures',
    },
    slug: 'plumbing-fixtures',
    order: 7,
    icon: 'IconDroplet',
    types: [
      {
        name: { he: 'ברזים', en: 'Faucets' },
        description: {
          he: 'ברזים למטבח וחדר רחצה',
          en: 'Faucets for kitchen and bathroom',
        },
        slug: 'faucets',
        order: 1,
        icon: 'IconDroplet',
      },
      {
        name: { he: 'כיורים', en: 'Sinks' },
        description: {
          he: 'כיורים למטבח וחדר רחצה',
          en: 'Sinks for kitchen and bathroom',
        },
        slug: 'sinks',
        order: 2,
        icon: 'IconBucket',
      },
      {
        name: { he: 'ברזי מקלחת', en: 'Shower Fixtures' },
        description: {
          he: 'ברזי מקלחת וטוש',
          en: 'Shower faucets and fixtures',
        },
        slug: 'shower-fixtures',
        order: 3,
        icon: 'IconDroplet',
      },
      {
        name: { he: 'כיורי אמבטיה', en: 'Bathtubs' },
        description: {
          he: 'אמבטיות ומוצרי אמבטיה',
          en: 'Bathtubs and bath products',
        },
        slug: 'bathtubs',
        order: 4,
        icon: 'IconBucket',
      },
      {
        name: { he: 'ברזי גינה', en: 'Outdoor Faucets' },
        description: {
          he: 'ברזים וצינורות לגינה',
          en: 'Garden faucets and hoses',
        },
        slug: 'outdoor-faucets',
        order: 5,
        icon: 'IconDroplet',
      },
    ],
  },
  {
    name: { he: 'חלונות ודלתות', en: 'Windows & Doors' },
    description: {
      he: 'חלונות, דלתות ומסגרות',
      en: 'Windows, doors and frames',
    },
    slug: 'windows-doors',
    order: 8,
    icon: 'IconWindow',
    types: [
      {
        name: { he: 'חלונות', en: 'Windows' },
        description: {
          he: 'חלונות מכל הסוגים - אלומיניום, עץ, PVC',
          en: 'Windows of all types - aluminum, wood, PVC',
        },
        slug: 'windows',
        order: 1,
        icon: 'IconWindow',
      },
      {
        name: { he: 'דלתות פנים', en: 'Interior Doors' },
        description: {
          he: 'דלתות פנים - עץ, זכוכית, MDF',
          en: 'Interior doors - wood, glass, MDF',
        },
        slug: 'interior-doors',
        order: 2,
        icon: 'IconDoor',
      },
      {
        name: { he: 'דלתות חוץ', en: 'Exterior Doors' },
        description: {
          he: 'דלתות כניסה ופתחים חיצוניים',
          en: 'Entry doors and exterior openings',
        },
        slug: 'exterior-doors',
        order: 3,
        icon: 'IconDoor',
      },
      {
        name: { he: 'מסגרות', en: 'Frames' },
        description: {
          he: 'מסגרות חלונות ודלתות',
          en: 'Window and door frames',
        },
        slug: 'frames',
        order: 4,
        icon: 'IconWindow',
      },
      {
        name: { he: 'תריסים', en: 'Shutters' },
        description: {
          he: 'תריסים וסוככים',
          en: 'Shutters and awnings',
        },
        slug: 'shutters',
        order: 5,
        icon: 'IconWindow',
      },
    ],
  },
  {
    name: { he: 'בדים וטקסטיל', en: 'Fabrics & Textiles' },
    description: {
      he: 'בדים לריהוט, וילונות וטקסטיל לבית',
      en: 'Fabrics for furniture, curtains and home textiles',
    },
    slug: 'fabrics-textiles',
    order: 9,
    icon: 'IconColorSwatch',
    types: [
      {
        name: { he: 'בדי ריפוד', en: 'Upholstery Fabrics' },
        description: {
          he: 'בדים לריפוד רהיטים',
          en: 'Fabrics for furniture upholstery',
        },
        slug: 'upholstery-fabrics',
        order: 1,
        icon: 'IconSofa',
      },
      {
        name: { he: 'וילונות', en: 'Curtains' },
        description: {
          he: 'בדי וילונות וקרונות',
          en: 'Curtain fabrics and rods',
        },
        slug: 'curtains',
        order: 2,
        icon: 'IconWindow',
      },
      {
        name: { he: 'מצעים', en: 'Bedding' },
        description: {
          he: 'בדי מצעים, כריות ושמיכות',
          en: 'Bedding fabrics, pillows and blankets',
        },
        slug: 'bedding',
        order: 3,
        icon: 'IconBed',
      },
      {
        name: { he: 'שטיחים', en: 'Rugs' },
        description: {
          he: 'שטיחים ושטיחונים',
          en: 'Rugs and area rugs',
        },
        slug: 'rugs',
        order: 4,
        icon: 'IconColorSwatch',
      },
      {
        name: { he: 'טפט בד', en: 'Fabric Wallpaper' },
        description: {
          he: 'טפטים מבד לריפוד קירות',
          en: 'Fabric wallpapers for wall covering',
        },
        slug: 'fabric-wallpaper',
        order: 5,
        icon: 'IconColorSwatch',
      },
    ],
  },
  {
    name: { he: 'חומרי ריהוט', en: 'Furniture Materials' },
    description: {
      he: 'חומרי גלם לייצור רהיטים',
      en: 'Raw materials for furniture manufacturing',
    },
    slug: 'furniture-materials',
    order: 10,
    icon: 'IconArmchair',
    types: [
      {
        name: { he: 'עץ מלא', en: 'Solid Wood' },
        description: {
          he: 'עץ מלא לרהיטים - אלון, אשור, אורן ועוד',
          en: 'Solid wood for furniture - oak, ash, pine and more',
        },
        slug: 'solid-wood',
        order: 1,
        icon: 'IconWood',
      },
      {
        name: { he: 'לוחות MDF', en: 'MDF Boards' },
        description: {
          he: 'לוחות MDF לרהיטים מודולריים',
          en: 'MDF boards for modular furniture',
        },
        slug: 'mdf-boards',
        order: 2,
        icon: 'IconLayers',
      },
      {
        name: { he: 'לוחות דיקט', en: 'Plywood' },
        description: {
          he: 'לוחות דיקט וחומרים מרוכבים',
          en: 'Plywood and composite materials',
        },
        slug: 'plywood',
        order: 3,
        icon: 'IconLayers',
      },
      {
        name: { he: 'מתכת', en: 'Metal' },
        description: {
          he: 'מתכות לרהיטים - ברזל, אלומיניום, נירוסטה',
          en: 'Metals for furniture - iron, aluminum, stainless steel',
        },
        slug: 'metal',
        order: 4,
        icon: 'IconTools',
      },
      {
        name: { he: 'זכוכית', en: 'Glass' },
        description: {
          he: 'זכוכית לרהיטים ושולחנות',
          en: 'Glass for furniture and tables',
        },
        slug: 'glass',
        order: 5,
        icon: 'IconWindow',
      },
      {
        name: { he: 'פלסטיק', en: 'Plastic' },
        description: {
          he: 'חומרים פלסטיים לרהיטים',
          en: 'Plastic materials for furniture',
        },
        slug: 'plastic',
        order: 6,
        icon: 'IconBox',
      },
    ],
  },
  {
    name: { he: 'גגות ותקרות', en: 'Roofing & Ceiling' },
    description: {
      he: 'חומרי גג ותקרה',
      en: 'Roofing and ceiling materials',
    },
    slug: 'roofing-ceiling',
    order: 11,
    icon: 'IconBuilding',
    types: [
      {
        name: { he: 'לוחות תקרה', en: 'Ceiling Tiles' },
        description: {
          he: 'לוחות תקרה מונמנים',
          en: 'Suspended ceiling tiles',
        },
        slug: 'ceiling-tiles',
        order: 1,
        icon: 'IconGrid3x3',
      },
      {
        name: { he: 'חומרי גג', en: 'Roofing Materials' },
        description: {
          he: 'רעפים, מתכת וציפויי גג',
          en: 'Tiles, metal and roof coatings',
        },
        slug: 'roofing-materials',
        order: 2,
        icon: 'IconBuilding',
      },
      {
        name: { he: 'בידוד', en: 'Insulation' },
        description: {
          he: 'חומרי בידוד תרמי ואקוסטי',
          en: 'Thermal and acoustic insulation materials',
        },
        slug: 'insulation',
        order: 3,
        icon: 'IconCloud',
      },
    ],
  },
  {
    name: { he: 'אביזרים דקורטיביים', en: 'Decorative Accessories' },
    description: {
      he: 'אביזרים וקישוטים לבית',
      en: 'Decorative accessories and home accents',
    },
    slug: 'decorative-accessories',
    order: 12,
    icon: 'IconStar',
    types: [
      {
        name: { he: 'מראות', en: 'Mirrors' },
        description: {
          he: 'מראות דקורטיביות לכל הבית',
          en: 'Decorative mirrors for the entire home',
        },
        slug: 'mirrors',
        order: 1,
        icon: 'IconEye',
      },
      {
        name: { he: 'תמונות ומסגרות', en: 'Art & Frames' },
        description: {
          he: 'תמונות, הדפסים ומסגרות',
          en: 'Artwork, prints and frames',
        },
        slug: 'art-frames',
        order: 2,
        icon: 'IconPalette',
      },
      {
        name: { he: 'וואזות ופיסול', en: 'Vases & Sculptures' },
        description: {
          he: 'וואזות, פסלים ופריטי נוי',
          en: 'Vases, sculptures and decorative items',
        },
        slug: 'vases-sculptures',
        order: 3,
        icon: 'IconPalette',
      },
      {
        name: { he: 'נרות ונרונות', en: 'Candles & Candleholders' },
        description: {
          he: 'נרות, נרונות ואביזרי תאורה דקורטיביים',
          en: 'Candles, candleholders and decorative lighting accessories',
        },
        slug: 'candles-candleholders',
        order: 4,
        icon: 'IconFlame',
      },
    ],
  },
]


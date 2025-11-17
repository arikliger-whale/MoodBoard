# Populate Category & Sub-Category Images Script

This script generates and uploads images for all categories and sub-categories that currently have empty images arrays using the Gemini AI image generation service.

## Problem Statement

The initial seed script (`prisma/seeds/seed-categories-enriched.ts`) populated categories and sub-categories with names, descriptions, and detailed content, but **did not generate images**. This script fixes that by:

1. Fetching all categories and sub-categories from the database
2. Identifying which ones have empty `images` arrays
3. Generating professional interior design images using Gemini AI
4. Uploading images to Google Cloud Storage
5. Updating the database with the image URLs

## Prerequisites

- **GEMINI_API_KEY** environment variable must be set
- Google Cloud Storage configured (for image uploads)
- Database connection configured in `.env`

## Usage

### Basic Usage

Run the script to populate images for all categories and sub-categories:

```bash
npx tsx scripts/populate-category-images.ts
```

### Dry Run (Preview Only)

See what the script would do without making any changes:

```bash
npx tsx scripts/populate-category-images.ts --dry-run
```

### Limit Number of Items

Process only the first N items (useful for testing):

```bash
npx tsx scripts/populate-category-images.ts --limit 5
```

### Categories Only

Process only categories (skip sub-categories):

```bash
npx tsx scripts/populate-category-images.ts --categories-only
```

### Sub-Categories Only

Process only sub-categories (skip categories):

```bash
npx tsx scripts/populate-category-images.ts --subcategories-only
```

### Custom Number of Images

Generate a different number of images per entity (default is 3):

```bash
npx tsx scripts/populate-category-images.ts --images 5
```

### Force Regenerate

Regenerate images even if they already exist:

```bash
npx tsx scripts/populate-category-images.ts --force
```

### Combined Options

You can combine multiple options:

```bash
# Dry run with limit, categories only
npx tsx scripts/populate-category-images.ts --dry-run --limit 3 --categories-only

# Generate 5 images per sub-category, first 10 only
npx tsx scripts/populate-category-images.ts --subcategories-only --images 5 --limit 10
```

## What the Script Does

### For Each Category:

1. **Checks if images exist**: Skips categories that already have images (unless `--force` is used)
2. **Generates images**: Uses Gemini AI to create 3 professional interior design images representing the category
3. **Uploads to GCS**: Images are uploaded to Google Cloud Storage
4. **Updates database**: The category record is updated with the GCS image URLs

### For Each Sub-Category:

1. **Checks if images exist**: Skips sub-categories that already have images (unless `--force` is used)
2. **Generates images**: Uses Gemini AI to create 3 professional interior design images representing the sub-category style
3. **Uploads to GCS**: Images are uploaded to Google Cloud Storage
4. **Updates database**: The sub-category record is updated with the GCS image URLs

## Image Generation Details

The script uses the **Gemini 2.5 Flash Image** AI service with **comprehensive, data-rich prompts** for maximum accuracy and authenticity.

### How It Works:

1. **Data Extraction**: The script extracts ALL available data from categories/sub-categories:
   - Name (English and Hebrew)
   - Description
   - Period (e.g., "1920-1939", "Ancient–19th Century")
   - **Detailed Content**:
     - Introduction & Description
     - Key Characteristics (arrays of defining features)
     - Visual Elements (signature design elements)
     - Material Guidance (preferred materials and finishes)
     - Color Guidance (color palette descriptions)
     - Design Philosophy (for approaches/styles)
     - Applications (common use cases)
     - Historical Context (background and evolution)
     - Cultural Context (cultural influences)

2. **Prompt Generation**: All this data is wrapped into a comprehensive, structured prompt that tells Gemini AI:
   - What design style/category to represent
   - Period and historical context
   - Specific characteristics to showcase
   - Visual elements that must be included
   - Materials and colors to use
   - Design philosophy to demonstrate
   - Authenticity requirements
   - Photography style and quality expectations

3. **Image Generation**:
   - **Model**: Gemini 2.5 Flash Image
   - **Quality**: Professional interior photography, architectural digest quality, museum-quality documentation
   - **Authenticity**: Period-accurate, avoiding anachronistic elements
   - **Content**: Each image authentically showcases the specific design style/category with:
     - All key characteristics visible
     - Signature visual elements included
     - Appropriate furniture, materials, and colors
     - Proper architectural details
     - Correct decorative elements
     - Period-accurate styling
   - **Format**: Images are generated as data URLs, then uploaded to GCS

### Example Prompt Structure:

For a **Baroque** sub-category with rich detailedContent:

```
Create a stunning, professional interior design photograph that represents the "Baroque" design style.
This style is from the period: 1600-1750.

Baroque design is characterized by dramatic grandeur, elaborate ornamentation, and dynamic movement...

Historical Background: Emerged during the Counter-Reformation as a symbol of Catholic Church power...

Key Characteristics to showcase:
- Ornate gilded decorations and intricate carvings
- Dramatic curved forms and twisted columns
- Rich, deep colors (burgundy, gold, deep green)
- Large-scale frescoes and ceiling paintings
- Heavy drapery with rich fabrics

Signature Visual Elements to include:
- Curved pediments and broken arches
- Sculpted putti and cherubs
- Elaborate chandeliers with crystal
- Marble columns and floors
- Ornamental mirrors with gilded frames

Materials & Finishes: Marble (white, colored), gold leaf, bronze, rich velvets, silk brocades, ornate wood carvings

Color Palette: Deep burgundy, royal gold, emerald green, rich purple, ivory white

The image should:
- Showcase a beautifully designed interior space that authentically represents the Baroque style
- Include all signature furniture, materials, colors, and decorative elements of this specific style
- Feature all the key characteristics and visual elements mentioned above
- Use the appropriate color palette and materials for this style
- Feature excellent lighting and composition that enhances the style's aesthetic
- Be photorealistic and professionally shot (architectural photography quality)
- Show a complete, well-styled room highlighting all the style's defining characteristics
- Capture the unique aesthetic, atmosphere, and authentic spirit of Baroque
- Be suitable for an interior design portfolio, style guide, or architectural digest magazine
- Maintain period accuracy and authenticity

Style: Professional interior photography, high-end, architectural digest quality, design magazine editorial, natural lighting that complements the style, wide angle showing full room with all characteristic Baroque elements clearly visible.
```

This comprehensive approach ensures that Gemini AI generates **accurate, authentic, and detailed** images that truly represent each design style/category.

## Output

The script provides detailed output including:

- Progress for each category/sub-category
- Image generation status
- Upload status
- Errors (if any)
- Final statistics summary

### Example Output:

```
🎨 Category & Sub-Category Image Population Script
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️  Options:
   Dry Run: NO
   Limit: None
   Images per entity: 3
   Categories only: NO
   Sub-categories only: NO
   Force regenerate: NO

📚 Processing Categories...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Status:
   Total: 5
   With images: 0
   Without images: 5

🎨 Will process 5 categories

[1/5] Historical (היסטוריים)
──────────────────────────────────────────────────────────────────
   📝 Name: Historical
   🔖 Slug: historical
   📅 Period: Ancient–19th Century
   🖼️  Generating 3 images...
   ✅ Generated 3 images
   🔗 First image: https://storage.googleapis.com/moodsphere-images/...
   💾 Saving to database...
   ✅ Saved to database
   ⏳ Waiting 3 seconds before next category...

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FINAL STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 CATEGORIES:
   Total: 5
   Already had images: 0
   Needed images: 5
   Processed: 5
   ✅ Succeeded: 5
   ❌ Failed: 0

📂 SUB-CATEGORIES:
   Total: 75
   Already had images: 0
   Needed images: 75
   Processed: 75
   ✅ Succeeded: 73
   ❌ Failed: 2

🎨 IMAGES:
   Total generated: 234

✅ All changes saved to database

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Script completed successfully!
```

## Error Handling

The script includes robust error handling:

- **Continues on error**: If one category/sub-category fails, the script continues with the next one
- **Detailed error messages**: Each error is logged with context
- **Summary statistics**: Final stats show how many succeeded vs failed
- **Fallback images**: If AI generation fails, placeholder images are used

## Performance Considerations

- **Rate limiting**: The script includes 3-second delays between entities to avoid API rate limits
- **Batch processing**: All operations are done sequentially to avoid overwhelming the API
- **Incremental saves**: Each entity is saved immediately after image generation (prevents data loss if script crashes)

## Troubleshooting

### Error: "GEMINI_API_KEY environment variable is not set"

**Solution**: Make sure your `.env` file contains:
```
GEMINI_API_KEY=your-api-key-here
```

### Error: "Failed to generate images"

**Possible causes**:
- API rate limit exceeded (wait and try again)
- Invalid API key
- Network issues

**Solution**: Run with `--limit 1` to test one entity first, or check API key validity.

### Images not appearing in admin panel

**Check**:
1. Verify images were saved to database:
   ```bash
   # Check a category
   npx prisma studio
   # Navigate to Category model and check images array
   ```
2. Verify GCS bucket permissions
3. Check image URLs are accessible

## Related Files

- **Main script**: `scripts/populate-category-images.ts`
- **Image generation service**: `src/lib/ai/image-generation.ts`
- **Storage service**: `src/lib/storage/gcp-storage.ts`
- **Prisma schema**: `prisma/schema.prisma` (Category and SubCategory models)

## Notes

- The script is **idempotent**: Running it multiple times won't duplicate work (unless `--force` is used)
- Images are stored in GCS under paths: `categories/{id}/`, `subcategories/{id}/`
- The script respects the existing seed service architecture and reuses the same image generation logic

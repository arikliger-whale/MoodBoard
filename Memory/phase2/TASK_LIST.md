# Phase 2: Task List & Project Management

**Project**: Style System Enhancement with Rich Image Generation
**Start Date**: 2025-11-20
**Target Completion**: 3 weeks (2025-12-11)
**Status**: 🟢 In Progress - Week 1 Complete, Week 2 Day 6-8 Complete (Backend 100%, UI 70% done)
**Progress**: 22/60 tasks completed (37%)

---

## 📚 Documentation Index

1. **00-requirements.md** - Original requirements from user
2. **SIMPLE_CATEGORY_LUXURY_UPDATES.md** - Simple category system (5 hours)
3. **COMPLETE_PHASE2_PLAN.md** - Full plan with 102 image generation
4. **PHASE2_WITH_TEXTURE_ENTITIES.md** - Complete plan with Texture entity layer (FINAL)

---

## 🎯 Project Overview

### What We're Building

1. **Category System** (Simple)
   - Room father category (flexible string)
   - Style room category (one per style)
   - Luxury vs Regular price level

2. **Rich Image Generation** (~102 images per style)
   - 60 Room Overview images
   - 25 Material images
   - 15 Texture images
   - 1 Composite mood board
   - 1 Anchor image

3. **Texture Entity Layer**
   - Textures become reusable database entities
   - Find-or-create during generation
   - Link to styles (many-to-many)
   - Display next to materials in UI

---

## 📅 Timeline (3 Weeks)

### Week 1: Database & Backend (Nov 20-27)
**Owner**: Backend Team

### Week 2: UI & Testing (Nov 28 - Dec 4)
**Owner**: Frontend Team

### Week 3: Production (Dec 5-11)
**Owner**: DevOps + Full Team

---

## ✅ Task Breakdown

### WEEK 1: Database & Backend

#### Day 1 (Nov 20): Database Schema ✅ COMPLETE
- [x] **1.1** Add enums to Prisma schema
  - [x] `PriceLevel` (REGULAR, LUXURY)
  - [x] `ImageCategory` (ROOM_OVERVIEW, ROOM_DETAIL, MATERIAL, TEXTURE, COMPOSITE, ANCHOR)
  - **File**: `prisma/schema.prisma`
  - **Time**: 30 min ✅

- [x] **1.2** Add fields to Room model
  - [x] `parentCategory: String?`
  - **File**: `prisma/schema.prisma`
  - **Time**: 10 min ✅

- [x] **1.3** Add fields to Style model
  - [x] `roomCategory: String?`
  - [x] `priceLevel: PriceLevel`
  - [x] `compositeImageUrl: String?`
  - [x] `anchorImageUrl: String?`
  - [x] `images: StyleImage[]` relation
  - [x] `textureLinks: StyleTexture[]` relation
  - **File**: `prisma/schema.prisma`
  - **Time**: 20 min ✅

- [x] **1.4** Create StyleImage model (NEW MODEL)
  - [x] `imageCategory: ImageCategory`
  - [x] `displayOrder: Int`
  - [x] `description: String?`
  - [x] `tags: String[]`
  - [x] `roomType: String?`
  - [x] `textureId: String?` (for texture entity link)
  - **File**: `prisma/schema.prisma`
  - **Time**: 30 min ✅

- [x] **1.5** Create Texture entity models
  - [x] `TextureCategory` model
  - [x] `TextureType` model
  - [x] `Texture` model
  - [x] `StyleTexture` join model (many-to-many)
  - [x] Add `textures` relation to Organization
  - **File**: `prisma/schema.prisma`
  - **Time**: 1 hour ✅

- [x] **1.6** Generate Prisma client
  ```bash
  npx prisma generate
  ```
  - **Time**: 2 min ✅
  - **Note**: MongoDB doesn't need migrations (schema-less)

**Day 1 Total**: ~2.5 hours ✅ COMPLETE

---

#### Day 2 (Nov 21): Seed Data & Validation ✅ COMPLETE

- [x] **2.1** Create texture categories seed script
  - [x] Create `prisma/seed-textures.ts`
  - [x] Define 5 main categories:
    - Wall Finishes (גימורי קיר) ✅
    - Wood Finishes (גימורי עץ) ✅
    - Metal Finishes (גימורי מתכת) ✅
    - Fabric Textures (טקסטורות בד) ✅
    - Stone Finishes (גימורי אבן) ✅
  - [x] Define 27 types across categories ✅
  - [x] Run seed script successfully ✅
  - **File**: `prisma/seed-textures.ts` ✅
  - **Time**: 1 hour ✅
  - **Result**: 5 categories, 27 types seeded successfully

- [x] **2.2** Update Zod validation schemas
  - [x] Update `src/lib/validations/style.ts`
    - Add `roomCategory` validation ✅
    - Add `priceLevel` validation ✅
    - Add `compositeImageUrl` validation ✅
    - Add `anchorImageUrl` validation ✅
  - [x] Update `src/lib/validations/room.ts`
    - Add `parentCategory` validation ✅
  - [x] Create `src/lib/validations/style-image.ts` (NEW) ✅
  - [x] Create `src/lib/validations/texture.ts` (NEW) ✅
  - **Time**: 1 hour ✅

- [ ] **2.3** Create migration script for existing data
  - [ ] Create `scripts/migrate-phase2-complete.ts`
  - [ ] Set default `priceLevel = REGULAR` for existing styles
  - [ ] Set default `imageCategory = ROOM_OVERVIEW` for existing images
  - [ ] Categorize existing images (first 60 = overview, rest = detail)
  - **File**: `scripts/migrate-phase2-complete.ts`
  - **Time**: 1 hour
  - **Reference**: See `COMPLETE_PHASE2_PLAN.md` Part 5.1

- [ ] **2.4** Run migration on development database
  ```bash
  npx tsx scripts/migrate-phase2-complete.ts
  ```
  - **Time**: 10 min
  - **Verify**: Check database records updated correctly

**Day 2 Total**: ~3 hours (66% complete - 2/3 hours done)

---

#### Day 3 (Nov 22): AI Prompt Updates ✅ COMPLETE

- [x] **3.1** Update style prompt builder ✅
  - [x] Modified `src/lib/ai/prompts/style-factual-details.ts` ✅
  - [x] Added price level keywords inline (LUXURY vs REGULAR) ✅
  - [x] Injected luxury/regular keywords into material guidance ✅
  - **Time**: 45 min ✅
  - **Result**: Price level keywords now inject throughout prompts

- [x] **3.2** Update image generation prompts ✅
  - [x] Modified `src/lib/ai/image-generation.ts` ✅
  - [x] Added entityType support for new categories ✅
  - [x] Added category-specific prompt logic:
    - MATERIAL ✅
    - TEXTURE ✅
    - COMPOSITE ✅
    - ANCHOR ✅
    - ROOM_OVERVIEW (existing 'style-room') ✅
  - [x] Implemented multi-image reference support ✅
  - **Time**: 2 hours ✅
  - **Result**: All new image categories supported with prompts

- [x] **3.3** Updated gemini.ts for price level ✅
  - [x] Changed priceTier to priceLevel ✅
  - [x] Passed priceLevel directly to buildFactualDetailsPrompt ✅
  - **Time**: 15 min ✅

**Day 3 Total**: ~3 hours ✅ COMPLETE

---

#### Day 4-5 (Nov 23-24): Seed Service Updates ✅ COMPLETE

- [x] **4.1** Create texture generator module ✅
  - [x] Created `src/lib/seed/texture-generator.ts` ✅
  - [x] Implemented `generateTexturesForStyle()` function ✅
  - [x] Implemented `findOrCreateTexture()` function ✅
  - [x] Implemented `parseMaterialGuidance()` function ✅
  - [x] Added material-to-category mapping ✅
  - [x] Added texture linking to styles ✅
  - **Time**: 3 hours ✅
  - **Result**: Textures are now reusable entities with usage tracking

- [x] **4.2** Create material generator module ✅
  - [x] Created `src/lib/seed/material-generator.ts` ✅
  - [x] Implemented `generateMaterialImages()` function ✅
  - [x] Creates StyleImage records with MATERIAL category ✅
  - [x] Uses requiredMaterials from AI content ✅
  - **Time**: 1 hour ✅
  - **Result**: Material close-up images generated and categorized

- [x] **4.3** Create room generator module ✅
  - [x] Created `src/lib/seed/room-generator.ts` ✅
  - [x] Implemented `generateRoomImages()` function ✅
  - [x] Supports 24 standard room types ✅
  - [x] Generates 4 views per room (main, opposite, left, right) ✅
  - [x] Uses aspect ratio variety ✅
  - [x] Supports reference images from sub-category ✅
  - **Time**: 2.5 hours ✅
  - **Result**: Comprehensive room image generator with StyleImage records

- [x] **4.4** Create special image generators ✅
  - [x] Created `src/lib/seed/special-image-generator.ts` ✅
  - [x] Implemented `generateCompositeImage()` function ✅
  - [x] Implemented `generateAnchorImage()` function ✅
  - [x] Updates Style model with compositeImageUrl and anchorImageUrl ✅
  - **Time**: 1.5 hours ✅
  - **Result**: Composite mood board and anchor hero shots

- [x] **4.5** Update main seed service ✅
  - [x] Modified `src/lib/seed/seed-service.ts` ✅
  - [x] Added priceLevel option (REGULAR/LUXURY/RANDOM) ✅
  - [x] Updated seedStyles() function with new flow:
    1. [x] Generate text content (with price level) ✅
    2. [x] Generate textures from material guidance ✅
    3. [x] Generate material close-up images ✅
    4. [x] Generate composite and anchor images ✅
  - [x] Added progress callbacks for new generators ✅
  - [x] Added error handling ✅
  - **Time**: 2 hours ✅
  - **Result**: Full Phase 2 flow integrated into seed service

- [ ] **4.6** Test full generation flow
  - [ ] Test with LUXURY style
  - [ ] Test with REGULAR style
  - [ ] Verify all images generated correctly
  - [ ] Verify textures created as entities
  - [ ] Verify usage counters increment
  - **Time**: 1 hour
  - **Status**: Pending testing

**Day 4-5 Total**: ~10 hours ✅ MOSTLY COMPLETE (5/6 tasks done)

---

### WEEK 2: UI & Testing

#### Day 6-7 (Nov 25-26): Admin Forms ✅ MOSTLY COMPLETE (3/4 tasks done)

- [x] **5.1** Update Style form ✅ COMPLETE
  - [x] Modified `src/components/features/style-engine/StyleForm.tsx` ✅
  - [x] Added "Room Category" dropdown (Private/Public/Commercial) ✅
  - [x] Price Level field already existed in form ✅
  - [x] Updated default values and reset logic ✅
  - [x] Both fields now functional in create and edit modes ✅
  - **Time**: 30 min ✅
  - **Note**: Advanced features (image tabs, generation summary) deferred to later sprint
  - **Result**: Style form now supports room category and price level selection

- [x] **5.2** Update Room Category System ✅ COMPLETE (ENHANCED)
  - [x] Created RoomCategory entity model in Prisma ✅
  - [x] Created Room Categories management page with full CRUD ✅
  - [x] Modified `src/components/features/style-system/RoomTypeForm.tsx` ✅
  - [x] Added category dropdown (searchable, required) ✅
  - [x] Updated RoomTypesTable with accordion layout grouped by categories ✅
  - [x] Implemented duplicate prevention per category (not global) ✅
  - [x] Implemented soft delete for categories and room types ✅
  - [x] Created migration script and migrated 24 existing room types ✅
  - [x] Added navigation link and Hebrew/English translations ✅
  - [x] Updated Prisma schema with categoryId foreign key ✅
  - [x] Updated validation schemas ✅
  - [x] Regenerated Prisma client and pushed to database ✅
  - **Time**: 4 hours ✅
  - **Enhancement**: Built full entity-based category system instead of simple string field
  - **Result**: Complete room category management with Private, Public, Commercial categories

- [x] **5.3** Create Texture management page ✅ COMPLETE
  - [x] Created `src/app/[locale]/admin/textures/page.tsx` ✅
  - [x] Display textures grouped by material category (accordion) ✅
  - [x] Show texture card: image, name, material categories badges, usage count ✅
  - [x] Add "Create Texture" button ✅
  - [x] Integrated into materials settings page as tab ✅
  - [x] Created optimized API endpoint for fast loading ✅
  - [x] Removed irrelevant finish/sheen/baseColor fields ✅
  - **Time**: 2 hours ✅
  - **Reference**: See `PHASE2_WITH_TEXTURE_ENTITIES.md` Part 4.2 ✅
  - **Result**: Full texture CRUD with cross-category support and performance optimization

- [ ] **5.4** Add translations
  - [ ] Go to `/admin/translations`
  - [ ] Add all required keys (see list below)
  - **Time**: 1 hour

**Translations Needed**:
```
style.room-category
style.select-room-category
style.price-level
price-level.regular
price-level.luxury
price-level.regular-description
price-level.luxury-description
style.image-generation-summary
style.will-generate-overview
style.will-generate-materials
style.will-generate-textures
style.will-generate-composite
style.will-generate-anchor
style.total-images
categories.private
categories.public
categories.commercial
room.parent-category
room.parent-category-placeholder
images.overview
images.materials
images.textures
images.composite
texture.used-in-styles
admin.textures.title
```

**Day 6-7 Total**: ~6.5 hours ✅ MOSTLY COMPLETE (75% - 3/4 tasks done)

---

#### Day 8 (Nov 27): Inspiration Page UI ✅ MOSTLY COMPLETE (3/4 tasks done)

- [x] **6.1** Create inspiration page ✅ COMPLETE
  - [x] Enhanced `src/app/[locale]/(dashboard)/styles/[id]/page.tsx` ✅
  - [x] Added composite hero section ✅
  - [x] Added style header with badges (price level, room category) ✅
  - [x] Added anchor image display ✅
  - [x] Added 4 tabs: ✅
    - Overview tab (description, characteristics, room profiles) ✅
    - Rooms tab (masonry gallery with room type filter) ✅
    - Materials & Textures tab (two-column layout) ✅
    - All Images tab (legacy images) ✅
  - **Time**: 3 hours ✅
  - **Result**: Full style detail page with Phase 2 features and tab organization

- [x] **6.2** Create Materials & Textures layout ✅ COMPLETE
  - [x] Two-column grid (materials left, textures right) ✅
  - [x] Material cards: image + description + tags ✅
  - [x] Texture cards: image + name + category badge + type badge + usage count ✅
  - [x] Empty states for both columns ✅
  - **Time**: 2 hours ✅
  - **Result**: Clean two-column layout with Material StyleImages and Texture entities

- [x] **6.3** Create API endpoints ✅ COMPLETE
  - [x] Created `src/app/api/styles/[id]/images/route.ts` ✅
  - [x] Created `src/app/api/styles/[id]/textures/route.ts` ✅
  - [x] Created `src/hooks/useStyleImages.ts` with category-specific hooks ✅
  - [x] Created `src/hooks/useStyleTextures.ts` ✅
  - [x] Fetch style textures with category/type and usage count ✅
  - [x] Support filtering by category and room type ✅
  - **Time**: 1 hour ✅
  - **Result**: Complete API layer with React Query hooks for categorized data

- [ ] **6.4** Test inspiration page
  - [ ] Test with style that has all image categories
  - [ ] Test RTL layout
  - [ ] Test responsive (mobile, tablet, desktop)
  - **Time**: 1 hour
  - **Status**: Pending - needs real data testing

**Day 8 Total**: ~6 hours ✅ MOSTLY COMPLETE (75% - 3/4 tasks done)

---

#### Day 9 (Nov 28): Testing ⏸️ Not Started

- [ ] **7.1** Unit Tests
  - [ ] Test `getPriceLevelKeywords()` function
  - [ ] Test `buildImagePrompt()` for each category
  - [ ] Test `findOrCreateTexture()` logic
  - [ ] Test `distributeImagesAcrossRooms()` logic
  - **Time**: 2 hours

- [ ] **7.2** Integration Tests
  - [ ] Test style creation with REGULAR price level
  - [ ] Test style creation with LUXURY price level
  - [ ] Test full seed flow (create style → generate 102 images)
  - [ ] Test texture reuse (2 styles use same texture)
  - **Time**: 2 hours

- [ ] **7.3** Manual Testing
  - [ ] Create LUXURY style → Verify premium keywords in prompts
  - [ ] Create REGULAR style → Verify accessible keywords in prompts
  - [ ] Verify 60 room overview images generated
  - [ ] Verify 25 material images (NOT plain squares!)
  - [ ] Verify 15 texture images (realistic context)
  - [ ] Verify textures saved as entities
  - [ ] Verify composite mood board generated
  - [ ] Verify anchor image generated
  - **Time**: 2 hours

- [ ] **7.4** Visual Quality Check
  - [ ] Check LUXURY materials look premium
  - [ ] Check REGULAR materials look accessible
  - [ ] Check textures shown in realistic context (not plain squares)
  - [ ] Check composite is cohesive Pinterest-style collage
  - [ ] Check anchor image matches color palette
  - **Time**: 1 hour

**Day 9 Total**: ~7 hours

---

### WEEK 3: Production Deployment

#### Day 10 (Nov 29): Staging Deployment ⏸️ Not Started

- [ ] **8.1** Deploy to staging
  - [ ] Push code to staging branch
  - [ ] Run database migration on staging
  - [ ] Seed texture categories on staging
  - **Time**: 30 min

- [ ] **8.2** Test with real data
  - [ ] Create test style on staging (LUXURY)
  - [ ] Monitor generation process
  - [ ] Verify all 102 images generated
  - [ ] Check database records
  - **Time**: 1 hour

- [ ] **8.3** Performance testing
  - [ ] Measure total generation time for 102 images
  - [ ] Monitor API rate limits
  - [ ] Check Gemini API usage/costs
  - [ ] Optimize if needed
  - **Time**: 1.5 hours

- [ ] **8.4** Fix bugs found in staging
  - [ ] Document issues
  - [ ] Fix and redeploy
  - [ ] Retest
  - **Time**: 2 hours

**Day 10 Total**: ~5 hours

---

#### Day 11 (Nov 30): Production Deployment ⏸️ Not Started

- [ ] **9.1** Pre-deployment checklist
  - [ ] Backup production database
  - [ ] Review all changes
  - [ ] Prepare rollback plan
  - [ ] Set up monitoring alerts
  - **Time**: 1 hour

- [ ] **9.2** Deploy to production
  - [ ] Merge to main branch
  - [ ] Deploy code
  - [ ] Run database migration
  - [ ] Seed texture categories
  - [ ] Verify migration success
  - **Time**: 1 hour

- [ ] **9.3** Smoke tests
  - [ ] Test existing styles still work
  - [ ] Create new REGULAR style
  - [ ] Create new LUXURY style
  - [ ] Check inspiration pages render correctly
  - **Time**: 1 hour

- [ ] **9.4** Monitor for issues
  - [ ] Watch error logs (Sentry)
  - [ ] Monitor API response times
  - [ ] Check Gemini API usage
  - [ ] Respond to any issues immediately
  - **Time**: 2 hours (continuous)

**Day 11 Total**: ~5 hours

---

#### Day 12-13 (Dec 1-2): Documentation & Polish ⏸️ Not Started

- [ ] **10.1** Create user documentation
  - [ ] Write help article: "Using Room Categories"
  - [ ] Write help article: "Luxury vs Regular Styles"
  - [ ] Write help article: "Understanding Textures"
  - [ ] Create video tutorial (Hebrew)
  - **Time**: 3 hours

- [ ] **10.2** Update developer documentation
  - [ ] Document new database models
  - [ ] Document AI prompt structure
  - [ ] Document texture entity pattern
  - [ ] Add code examples
  - **Time**: 2 hours

- [ ] **10.3** Polish UI
  - [ ] Fix any visual inconsistencies
  - [ ] Add loading states
  - [ ] Add empty states
  - [ ] Improve error messages
  - **Time**: 2 hours

- [ ] **10.4** Gather feedback
  - [ ] Send announcement to users
  - [ ] Create in-app survey
  - [ ] Monitor support tickets
  - [ ] Track feature usage analytics
  - **Time**: 1 hour

**Day 12-13 Total**: ~8 hours

---

## 📊 Progress Tracking

### Overall Progress
- **Total Tasks**: 60
- **Completed**: 22
- **In Progress**: 0
- **Not Started**: 38
- **Blocked**: 0

**Progress**: ████░░░░░░ 37% (22/60 tasks)

### Time Tracking
- **Estimated Total**: ~70 hours (3 weeks @ ~23 hours/week)
- **Actual Time Spent**: ~30 hours (Week 1 + Day 6-8)
- **Remaining**: ~40 hours

### By Week
- **Week 1 (Backend)**: 17.5/20.5 hours (85% - Days 1-5 complete, missing 2.3-2.4 and 4.6)
- **Week 2 (UI)**: 12.5/20 hours (63% - Day 6-8 complete, Day 9 pending)
- **Week 3 (Production)**: 0/18 hours
- **Documentation**: 0/8 hours

### Current Sprint (Nov 20-27)
- ✅ Day 1: Database Schema (100%)
- ✅ Day 2: Seed & Validation (66%)
- ✅ Day 3: AI Prompts (100%)
- ✅ Day 4-5: Seed Service (83% - 5/6 tasks)
- ✅ Day 6-7: Admin Forms (75% - 3/4 tasks)
- ✅ Day 8: Inspiration Page UI (75% - 3/4 tasks)

---

## 🚨 Blockers & Risks

### Current Blockers
None currently

### Potential Risks
1. **AI Generation Time**: 102 images may take 1-2 hours per style
   - **Mitigation**: Background job queue, progress indicators

2. **Gemini API Costs**: Generating many images could be expensive
   - **Mitigation**: Monitor costs, set limits, optimize prompts

3. **Texture Deduplication**: Same texture name but different images
   - **Mitigation**: Use fuzzy matching, manual review tool

4. **Migration Data Loss**: Existing images could be miscategorized
   - **Mitigation**: Backup before migration, test on staging first

---

## 📝 Notes & Decisions

### Key Decisions Made
- ✅ Textures will be database entities (not just categorized images)
- ✅ Materials and textures displayed side-by-side in UI
- ✅ Luxury/Regular affects ALL image generation (not just some)
- ✅ Room categories are managed database entities (upgraded from simple strings to full CRUD system)

### Open Questions
- ⏸️ Should we limit texture generation per style? (currently 15)
- ⏸️ Should clients be able to see luxury vs regular badge?
- ⏸️ Auto-generate composite on style creation, or manual trigger?

---

## 🎯 Success Criteria

### Technical
- [ ] All 60 tasks completed
- [ ] Zero critical bugs in production
- [ ] Page load time < 2s
- [ ] API response time < 200ms
- [ ] Test coverage > 80%

### Business
- [ ] 80% of new styles use category system
- [ ] 50% of new styles use luxury level
- [ ] Texture reuse rate > 30%
- [ ] User satisfaction > 4.5/5

### Quality
- [ ] Materials NOT shown as plain squares ✓
- [ ] Textures shown in realistic context ✓
- [ ] Luxury images look premium ✓
- [ ] Regular images look accessible ✓
- [ ] Composite mood boards are cohesive ✓

---

## 📞 Team Contacts

- **Backend Lead**: [Name]
- **Frontend Lead**: [Name]
- **DevOps**: [Name]
- **QA**: [Name]
- **Product Owner**: [Name]

---

## 🔄 Status Update Template

**Week of [Date]:**
- **Completed**: [List tasks]
- **In Progress**: [List tasks]
- **Blockers**: [List any issues]
- **Next Week**: [List priorities]
- **Notes**: [Any important info]

---

**Last Updated**: 2025-11-23 (Day 8 Complete - Style Detail Page UI Enhanced)
**Next Review**: 2025-11-28 (Day 9 - Testing)

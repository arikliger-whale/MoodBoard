# Phase 2: Style Engine Core - Updated Plan

**Last Updated:** November 2, 2025  
**Architecture:** Route-based admin area (`/admin/*`), Inspiration Library System, Style Approval Workflow

---

## 🎯 Key Concepts

### 1. Style Types & Workflow

**Global Styles** (`organizationId = null`)
- Created by **admin only**
- Available to all organizations
- Pre-defined styles (Scandinavian, Japandi, etc.)
- No approval needed

**Public Styles** (`organizationId = value`, `isPublic = true`, `approvalStatus = 'pending'|'approved'|'rejected'`)
- Created by **organizations**
- Submitted for admin approval
- Once approved, available to all organizations
- Admin can approve/reject/review

**Personal Styles** (`organizationId = value`, `isPublic = false`)
- Created by **organizations**
- Organization-specific only
- No approval needed
- Not visible to other organizations

### 2. Inspiration Library System

**Project-Level Inspiration** (`projectId = value`)
- Each project has its own inspiration folder
- Save rooms, styles, palettes, materials for that project
- Project-specific collection

**User-Level Inspiration** (`userId = value`, `projectId = null`)
- Each user has a general inspiration folder
- Not associated with any project
- Personal collection across all projects

**Inspiration Items**:
- Rooms (with dimensions, style, materials)
- Styles (references to styles)
- Palettes (color combinations)
- Materials (material references)
- Images/Moodboards

### 3. Admin Area (`/admin/*`)

**Admin-Only Routes**:
- `/admin/styles` - Manage global styles & approve public styles
- `/admin/materials` - Manage global materials
- `/admin/organizations` - Manage organizations
- `/admin/users` - Manage platform users
- `/admin/approvals` - Review pending style approvals

---

## 📋 Updated Phase 2 Implementation Plan

### Part A: Schema Updates & Foundation

#### 1.1 Update StyleMetadata
```prisma
type StyleMetadata {
  version         String
  isPublic        Boolean  @default(false)
  approvalStatus  String?  // null, 'pending', 'approved', 'rejected'
  approvedBy      String?   @db.ObjectId
  approvedAt      DateTime?
  rejectionReason String?
  tags            String[]
  usage           Int       @default(0)
  rating          Float?
}
```

#### 1.2 Create InspirationLibrary Model
```prisma
model InspirationLibrary {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  userId          String   @db.ObjectId
  user            User     @relation(fields: [userId], references: [id])
  
  projectId       String?  @db.ObjectId  // null = user-level, value = project-level
  project         Project? @relation(fields: [projectId], references: [id])
  
  name            String   // "My Inspiration" or project name
  type            String   // 'user' | 'project'
  
  items           InspirationItem[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @default(now())
  
  @@unique([userId, projectId])  // One library per user-project combo
  @@map("inspiration_libraries")
}

type InspirationItem {
  id          String   @default(uuid())
  type        String   // 'room' | 'style' | 'palette' | 'material' | 'image'
  referenceId String?  @db.ObjectId  // ID of the referenced item
  data        Json?    // Snapshot/embed data
  notes       String?
  tags        String[]
  savedAt     DateTime @default(now())
}
```

#### 1.3 Add Relations
- User → InspirationLibrary (one-to-many)
- Project → InspirationLibrary (one-to-many, optional)

---

### Part B: Admin Area Setup

#### 2.1 Admin Authentication Middleware
- Check if user role = 'admin'
- Redirect non-admins from `/admin/*` routes
- Create `requireAdmin()` middleware function

#### 2.2 Admin Layout Component
- Separate layout from dashboard
- Admin navigation sidebar
- Admin header with user info
- Route: `/admin/layout.tsx`

#### 2.3 Admin Routes Structure
```
/admin
├── layout.tsx              # Admin layout
├── page.tsx                # Admin dashboard
├── styles/
│   ├── page.tsx            # Global styles management
│   ├── [id]/
│   │   └── page.tsx        # Edit global style
│   └── approvals/
│       └── page.tsx        # Pending style approvals
├── materials/
│   └── page.tsx            # Global materials management
└── organizations/
    └── page.tsx            # Organization management
```

---

### Part C: Style Management APIs

#### 3.1 Admin Styles API (`/api/admin/styles`)
- `GET /api/admin/styles` - List all global styles
- `POST /api/admin/styles` - Create global style
- `GET /api/admin/styles/[id]` - Get global style
- `PATCH /api/admin/styles/[id]` - Update global style
- `DELETE /api/admin/styles/[id]` - Delete global style
- `GET /api/admin/styles/approvals` - List pending approvals
- `POST /api/admin/styles/[id]/approve` - Approve public style
- `POST /api/admin/styles/[id]/reject` - Reject public style

#### 3.2 User Styles API (`/api/styles`)
- `GET /api/styles` - List available styles (global + approved public + org personal)
- `POST /api/styles` - Create style (personal or public)
- `GET /api/styles/[id]` - Get style details
- `PATCH /api/styles/[id]` - Update style (if owner)
- `DELETE /api/styles/[id]` - Delete style (if owner)
- Filters: `?scope=global|public|personal&category=...&search=...`

---

### Part D: Inspiration Library APIs

#### 4.1 Inspiration Library API (`/api/inspiration`)
- `GET /api/inspiration` - Get user's inspiration libraries
- `GET /api/inspiration/[libraryId]` - Get library items
- `POST /api/inspiration` - Create inspiration library (if needed)
- `POST /api/inspiration/[libraryId]/items` - Add item to library
- `DELETE /api/inspiration/[libraryId]/items/[itemId]` - Remove item
- `GET /api/inspiration/project/[projectId]` - Get project inspiration
- `GET /api/inspiration/user` - Get user's general inspiration

---

### Part E: User-Facing UI

#### 5.1 Style Library Browser (`/styles`)
- Browse available styles
- Filter by: category, scope (global/public/personal), tags
- Search styles
- View style details
- Apply style to project
- Save style to inspiration

#### 5.2 Style Detail Page (`/styles/[id]`)
- Style preview
- Palette display
- Material set display
- Room profiles
- Apply to project button
- Save to inspiration button
- Edit button (if owner)

#### 5.3 Create Style Page (`/styles/new`)
- Style creation wizard
- Choose: Personal or Public
- Palette editor
- Material set configurator
- Room profiles editor
- Submit for approval (if public)

#### 5.4 Inspiration Library UI
- Inspiration sidebar/widget
- Project inspiration tab
- User inspiration page (`/inspiration`)
- Save item modal
- Inspiration item cards
- Organize by folders/tags

---

### Part F: Admin UI

#### 6.1 Admin Dashboard (`/admin`)
- Statistics: Total styles, pending approvals, etc.
- Recent activity
- Quick actions

#### 6.2 Admin Styles Page (`/admin/styles`)
- List all global styles
- Create/edit/delete global styles
- Search and filter

#### 6.3 Style Approvals Page (`/admin/styles/approvals`)
- List pending public styles
- View style details
- Approve/Reject with reason
- Notification to organization

---

## 🔄 Style Approval Workflow

### Organization Creates Public Style:
1. User creates style → selects "Public"
2. Style saved with `isPublic = true`, `approvalStatus = 'pending'`
3. Organization can see it in "My Styles" (pending status)
4. Admin notification sent

### Admin Reviews:
1. Admin sees in `/admin/styles/approvals`
2. Admin reviews style details
3. Admin approves or rejects with reason
4. If approved: `approvalStatus = 'approved'`, style becomes available globally
5. If rejected: `approvalStatus = 'rejected'`, organization notified

### Organization Creates Personal Style:
1. User creates style → selects "Personal"
2. Style saved with `isPublic = false`, `approvalStatus = null`
3. Immediately available to organization only
4. No approval needed

---

## 📊 Database Schema Summary

### Style Model (Updated)
```prisma
model Style {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  organizationId  String?  @db.ObjectId  // null = global, value = org-specific
  organization    Organization? @relation(...)
  
  slug            String   @unique
  name            LocalizedString
  category        String
  
  palette         Palette
  materialSet     MaterialSet
  roomProfiles   RoomProfile[]
  
  metadata        StyleMetadata  // Includes approvalStatus
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @default(now())
}
```

### InspirationLibrary Model (New)
```prisma
model InspirationLibrary {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  userId          String   @db.ObjectId
  projectId       String?  @db.ObjectId  // null = user-level
  
  name            String
  type            String   // 'user' | 'project'
  items           InspirationItem[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @default(now())
}
```

---

## 🎨 UI Components Needed

### User Area:
- `StyleLibraryBrowser` - Browse/search styles
- `StyleCard` - Style preview card
- `StyleDetailView` - Full style details
- `CreateStyleWizard` - Multi-step style creation
- `InspirationLibrary` - Inspiration folder component
- `SaveToInspiration` - Save item modal

### Admin Area:
- `AdminLayout` - Admin-specific layout
- `AdminNavigation` - Admin sidebar
- `StyleApprovalList` - Pending approvals
- `StyleApprovalCard` - Approval review card
- `GlobalStyleManager` - CRUD for global styles

---

## ✅ Implementation Checklist

### Week 1: Foundation
- [ ] Update Prisma schema (StyleMetadata, InspirationLibrary)
- [ ] Run migrations
- [ ] Create admin authentication middleware
- [ ] Create admin layout component
- [ ] Set up admin routes structure

### Week 2: APIs
- [ ] Admin styles API (CRUD + approvals)
- [ ] User styles API (create, browse, filter)
- [ ] Inspiration library API
- [ ] Validation schemas (Zod)

### Week 3: Admin UI
- [ ] Admin dashboard
- [ ] Admin styles management page
- [ ] Style approvals page
- [ ] Admin navigation

### Week 4: User UI
- [ ] Style library browser
- [ ] Style detail page
- [ ] Create style wizard
- [ ] Inspiration library component
- [ ] Save to inspiration functionality

### Week 5: Polish & Integration
- [ ] Apply style to project workflow
- [ ] Notifications for approvals
- [ ] Seed data (7 global styles)
- [ ] Testing & bug fixes

---

## 🔐 Permissions Matrix

| Action | Admin | Designer Owner | Designer Member | Client |
|--------|-------|----------------|-----------------|--------|
| Create global style | ✅ | ❌ | ❌ | ❌ |
| Create public style | ❌ | ✅ | ✅ | ❌ |
| Create personal style | ❌ | ✅ | ✅ | ❌ |
| Approve public style | ✅ | ❌ | ❌ | ❌ |
| Browse global styles | ✅ | ✅ | ✅ | ✅ |
| Browse approved public | ✅ | ✅ | ✅ | ✅ |
| Browse personal (own org) | ✅ | ✅ | ✅ | ❌ |
| Edit style (own) | ✅ | ✅ | ✅ | ❌ |
| Delete style (own) | ✅ | ✅ | ❌ | ❌ |
| Save to inspiration | ✅ | ✅ | ✅ | ✅ |

---

## 📝 Notes

- **Inspiration Library** is a collection system, not a creation tool
- Users can save references to styles/rooms/etc, not create new ones
- Project inspiration is accessible to all project team members
- User inspiration is private to the user
- Public styles require admin approval before becoming globally available
- Personal styles are immediately available to the organization

---

**Ready to start implementation!** 🚀


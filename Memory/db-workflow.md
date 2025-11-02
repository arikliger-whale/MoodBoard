# MongoDB Schema Management with Prisma

**Last Updated:** January 2025

## Key Decision: Prisma over Mongoose

After evaluation, **Prisma is the optimal choice** for MoodB:
- ✅ Already well-integrated with TypeScript strict mode
- ✅ Type-safe queries throughout codebase
- ✅ No migrations needed with MongoDB (`db push` only)
- ✅ Perfect for our CRUD-heavy operations
- ✅ Works seamlessly with NextAuth.js
- ✅ Multi-tenancy scoping built-in

**Mongoose** would only be better for:
- Complex aggregation pipelines (Prisma supports `$queryRaw`)
- MongoDB-specific features like Change Streams
- Heavy document manipulation

**Our project doesn't need these** - we prioritize type safety and clean CRUD operations.

---

## Daily Development Workflow

### 1. Making Schema Changes
```bash
# Edit prisma/schema.prisma with your changes
# Then sync to MongoDB (no migrations needed!)
pnpm db:push
```

### 2. Regenerating Types
```bash
# After any schema changes, regenerate TypeScript types
pnpm db:generate
```

### 3. Viewing Data
```bash
# Open Prisma Studio to browse/edit data
pnpm db:studio
```

## Key Points

### ✅ DO:
- Use `pnpm db:push` for schema changes (MongoDB-friendly)
- Always run `pnpm db:generate` after schema changes
- Test schema changes in development first
- Use embedded `type` for nested structures (MongoDB-native)
- Scope all queries by `organizationId` (multi-tenancy)

### ❌ DON'T:
- Don't use `pnpm db:migrate` (that's for SQL databases)
- Don't worry about migration files
- Don't use `any` type - Prisma generates proper types
- Don't bypass Prisma for direct MongoDB queries (unless necessary)

## MongoDB-Specific Features in Your Schema

### Embedded Types (No Joins!)
```prisma
type Room {
  id             String
  name           String
  materials      MaterialReference[]  // Embedded!
}

model Project {
  rooms Room[]  // Embedded array in MongoDB
}
```

### ObjectId References
```prisma
model Project {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  clientId String @db.ObjectId
  client   Client @relation(fields: [clientId], references: [id])
}
```

## Common Patterns

### Creating with Nested Data
```typescript
const project = await prisma.project.create({
  data: {
    name: "Modern Living Room",
    organizationId,
    clientId,
    rooms: [
      {
        id: nanoid(),
        name: "Living Room",
        type: "Living",
        dimensions: {
          length: 5.5,
          width: 4.2,
          height: 2.8,
          unit: "m"
        }
      }
    ],
    metadata: {
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: userId
    }
  }
})
```

### Updating Embedded Arrays
```typescript
// MongoDB allows atomic array operations
const project = await prisma.project.update({
  where: { id: projectId },
  data: {
    rooms: {
      push: newRoom  // MongoDB $push operator
    }
  }
})

// Or replace entire array (more common with Prisma)
const updatedProject = await prisma.project.update({
  where: { id: projectId },
  data: {
    rooms: [...existingRooms, newRoom]
  }
})
```

## Schema Change Example

1. **Add new field to Organization:**
```prisma
model Organization {
  id   String @id @default(auto()) @map("_id") @db.ObjectId
  name String
  slug String @unique
  logo String?  // ← NEW FIELD
  // ... rest
}
```

2. **Push to MongoDB:**
```bash
pnpm db:push
```

3. **Regenerate types:**
```bash
pnpm db:generate
```

4. **Use immediately:**
```typescript
const org = await prisma.organization.update({
  where: { id: orgId },
  data: { logo: "https://..." }
})
// TypeScript knows about `logo` now!
```

## When to Use Raw MongoDB Queries

Only use `prisma.$runCommandRaw` for:
- Complex aggregations
- Text search
- Bulk operations
- MongoDB-specific features

```typescript
// Example: Complex aggregation
const results = await prisma.$runCommandRaw({
  aggregate: 'projects',
  pipeline: [
    { $match: { organizationId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ],
  cursor: {}
})
```

## Production Considerations

### Environment Variables
```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/moodb?retryWrites=true&w=majority"
```

### Schema Validation
MongoDB collections will validate against your Prisma schema automatically when using `db push`.

### Indexes
Prisma creates indexes for:
- `@unique` fields
- `@id` fields
- `@@index` definitions

```prisma
model Project {
  @@index([organizationId])
  @@index([clientId])
  @@index([status])
}
```

## Troubleshooting

### "Type X doesn't exist"
```bash
# Regenerate Prisma Client
pnpm db:generate
# Restart TypeScript server in your IDE
```

### "Field doesn't exist in database"
```bash
# Push schema changes
pnpm db:push
```

### Connection Issues
```bash
# Check MongoDB connection
pnpm db:studio
# If it opens, your connection is fine
```

## Resources

- [Prisma MongoDB Docs](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Your Schema](../prisma/schema.prisma)
- [Prisma Studio](http://localhost:5555) (when running)


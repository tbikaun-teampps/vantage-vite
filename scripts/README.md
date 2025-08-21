# Scripts

Utility scripts for Vantage data management.

## Available Scripts

### add-shared-roles-to-db.ts

Loads shared roles from `data/shared_roles.ts` into the database.

**Usage:**

```bash
npx tsx scripts/add-shared-roles-to-db.ts
```

**Requirements:**

- `.env` file with:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY`

**Features:**

- Checks for existing roles before inserting
- Provides summary of inserted/skipped roles
- Handles errors gracefully

### nuke-db.ts

Deletes all database tables except `profiles` and `shared_roles`.

**Usage:**

```bash
npm run db:nuke
```

**Features:**

- Safety confirmation prompt (requires typing 'YES')
- Preserves critical tables (`profiles`, `shared_roles`)
- Handles foreign key constraints with proper deletion order
- Supports all table types (bigint IDs, UUID IDs, junction tables)
- Detailed progress reporting and summary

## Data Files

- `data/shared_roles.ts` - Contains predefined roles used across companies
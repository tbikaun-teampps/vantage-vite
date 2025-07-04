# Scripts

Utility scripts for Vantage data management.

## Available Scripts

### add-shared-roles-to-db.js
Loads shared roles from `shared_roles.json` into the database.

**Usage:**
```bash
node scripts/add-shared-roles-to-db.js
```

**Requirements:**
- `.env` file with:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY`
  - `ADMIN_USER_ID`

**Features:**
- Checks for existing roles before inserting
- Provides summary of inserted/skipped roles
- Handles errors gracefully

## Data Files

- `shared_roles.json` - Contains predefined roles used across companies
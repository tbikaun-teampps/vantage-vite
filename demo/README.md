# Demo Data Generator

Generates comprehensive demo company data for demonstration purposes and onboarding.

## Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your values:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (bypasses RLS)
   - `SUPABASE_ANON_KEY`: Your Supabase anon/public key (fallback)
   - `ADMIN_USER_ID`: Your user ID from Supabase auth.users table

## Usage

```bash
# From the demo directory
node generate.js

# Or from the project root
node ./demo/generate.js
```

## What it creates

- **1 Demo Company**: Acme Manufacturing Corp with complete organizational hierarchy
- **4 Assessments**: In different states (draft, active, under_review, completed)
- **Multiple Interviews**: With varying completion levels and realistic responses
- **Complete Survey Structure**: Questions, rating scales, role associations
- **Organizational Data**: Business units, regions, sites, asset groups, org charts, roles

## Data Structure

```text
Acme Manufacturing Corp
├── Operations Division
│   ├── North America
│   │   ├── Detroit Factory (Production Line A, Quality Control Station)
│   │   └── Chicago Warehouse (Storage Area A)
│   └── Europe
│       └── Berlin Plant (Assembly Line B)
└── Safety & Compliance
    └── Global Safety
        └── Training Center (Training Equipment)
```

## Notes

- **Automatic Cleanup**: Existing demo data is automatically removed before generation
- **Safe Operation**: Only affects records marked with `is_demo: true`
- **Complete Relationships**: All foreign keys and association tables are properly created
- **Realistic Data**: Includes varied assessment states and interview responses
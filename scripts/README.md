# Scripts

Utility scripts for Vantage data management.

## Available Scripts

### send-test-email.ts

Interactive CLI tool to test all Handlebars email templates by sending them to a test recipient.

**Usage:**

```bash
npx tsx scripts/send-test-email.ts
```

**Requirements:**

- `.env` file in `scripts/` directory with:
  - `RESEND_API_KEY` - Your Resend API key
  - `SITE_URL` (optional) - Base URL for your app (defaults to http://localhost:5173)

**Features:**

- Interactive menu to select email template type:
  - Test Email (green gradient, simple verification)
  - Interview Invitation (requires database, shows info message)
  - Interview Reminder (shows mock data)
  - Team Member Invite (green gradient, with role and invite link)
  - Role Change Notification (purple gradient, shows old → new role)
- Customizable recipient email (defaults to tbikaun@teampps.com.au)
- Mock data generation for each email type
- Validates template rendering and email delivery
- Detailed success/error feedback

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



<!-- ---- -->


## CLI Todo
- [x] Add contacts on createCompany
- [x] Allow public interview creation onto assessments and programs
  - [x] Contact detials
- [x] Add metrics to project creation
- [x] Populate phases with metrics data
- [x] Populate phases with interviews data
- [x] Update cli actions to ask for the name of things (assessment)
- [x] Allow program to take one questionnaire without needing both.
- [ ] Add recommendations creation with LLM generation and linakge to where it comes from
- [ ] Allow LLM to be used for generating actions, comments on interviews.


- [ ] Wipe marks account and repopulate with fresh data
  - [ ] Two onsite assessments standalone
  - [ ] Two programs
    - [ ] One long term (long questionnaire, with presite and metrics)
    - [ ] One short term (short questionnaire, no presite, no metrics)


Run the generation CLI:
```
npx tsc ./scripts/cli.ts 
```
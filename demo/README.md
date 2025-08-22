# Demo Data Generator

Generates demo company data for testing and demonstration purposes.

## Setup

Create a `.env` file in the demo directory with:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (bypasses RLS)
- `ADMIN_USER_ID`: Your user ID from Supabase auth.users table

## Scripts

### Full Demo Data
```bash
npm run db:add_demo
```
Generates complete demo dataset with all companies, assessments, questionnaires, and interviews.

### Test Demo Data
```bash
npm run db:test_add_demo
```
Generates minimal demo dataset for fast testing:
- 1 company with single organizational path (BU → region → site → asset group)
- 1 questionnaire with 2 questions only
- 1 assessment
- Interviews with incomplete responses for active assessments

### Database Reset
```bash
npm run db:nuke
```
Completely wipes the database (use with caution).

## Features

- **Interview Completion**: Interview status matches assessment status (active assessments → in_progress interviews with incomplete responses)
- **Multiple Interviews**: 1-4 interviews per assessment (first is multi-role, subsequent are single-role focused)
- **Automatic Cleanup**: Removes existing demo data before regeneration
- **Safe Operation**: Only affects records marked with `is_demo: true`
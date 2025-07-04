# Types Directory Structure

This directory contains all TypeScript type definitions for the Vantage application, organized for maintainability and linked directly to Supabase database types.

## 📁 Directory Structure

```
/src/types/
├── README.md              # This file
├── index.ts               # Main exports barrel file
├── database.ts            # Auto-generated Supabase types
├── utils.ts               # Type utilities and helpers
│
├── /domains/              # Business domain types
│   ├── auth.ts           # User authentication & profiles
│   ├── assessment.ts     # Assessment & interview types
│   ├── questionnaire.ts  # Questionnaire builder types
│   ├── company.ts        # Company hierarchy types
│   ├── analytics.ts      # Charts, metrics, reporting
│   └── ui.ts            # Generic UI component types
│
├── /api/                 # API-related types
│   ├── requests.ts       # Create/Update DTOs
│   ├── responses.ts      # API response types
│   └── filters.ts        # Search and filter types
│
└── /forms/               # Form validation types
    ├── schemas.ts        # Zod validation schemas
    └── validation.ts     # Form-specific types
```

## 🎯 Key Principles

### 1. **Database-First Approach**
All entity types extend from auto-generated Supabase types in `database.ts`:
```typescript
// ✅ Good - extends database type
export interface Assessment extends DatabaseAssessment {
  interview_count?: number
}

// ❌ Bad - separate definition that can drift
export interface Assessment {
  id: number
  name: string
  // ... manually defined fields
}
```

### 2. **Consistent ID Types**
Use database types as source of truth for ID consistency:
```typescript
// All IDs are numbers (from Supabase auto-increment)
export type AssessmentId = Database['public']['Tables']['assessments']['Row']['id']
export type InterviewId = Database['public']['Tables']['interviews']['Row']['id']
```

### 3. **Domain Organization**
Types are grouped by business domain, not technical layer:
- `auth.ts` - Everything related to users and authentication
- `assessment.ts` - Assessment lifecycle and interviews
- `questionnaire.ts` - Questionnaire builder and templates
- `company.ts` - Company hierarchy and organizational structure

### 4. **Import Strategy**
```typescript
// ✅ Import from index for external files
import { Assessment, CreateAssessmentData } from '@/types'

// ✅ Import directly for internal type files
import type { DatabaseAssessment } from './database'
```

## 🔄 Type Patterns

### Entity Pattern
```typescript
// Base database type
export type DatabaseAssessment = Database['public']['Tables']['assessments']['Row']

// Enhanced application type
export interface Assessment extends DatabaseAssessment {
  // Computed fields
  interview_count?: number
  completed_interviews?: number
  
  // Relations
  questionnaire?: Pick<Questionnaire, 'name' | 'type'>
  company?: Pick<Company, 'name'>
}

// Extended variants
export interface AssessmentWithCounts extends Assessment {
  interview_count: number
  completed_interview_count: number
}
```

### Form Data Pattern
```typescript
// Creation data (required fields only)
export type CreateAssessmentData = Pick<Assessment, 'name' | 'questionnaire_id'> & {
  description?: string
}

// Update data (all optional)
export type UpdateAssessmentData = Partial<Pick<Assessment, 'name' | 'description' | 'status'>>
```

### Filter Pattern
```typescript
export interface AssessmentFilters {
  status?: Assessment['status'][]
  questionnaire_id?: Assessment['questionnaire_id']
  date_range?: { start: string; end: string }
  search?: string
}
```

## 🛠 Migration Guide

### Phase 1: Replace Imports
```typescript
// Before
import type { Assessment } from '@/types/assessment'

// After  
import type { Assessment } from '@/types'
```

### Phase 2: Update Entity Definitions
```typescript
// Before - custom interface
interface Assessment {
  id: number
  name: string
  // ...
}

// After - extends database type
interface Assessment extends DatabaseAssessment {
  // Only add computed fields
  interview_count?: number
}
```

### Phase 3: Consolidate Duplicates
Remove duplicate type definitions and use the centralized versions.

## 🔧 Utilities

The `utils.ts` file provides helpful type utilities:

```typescript
// Add count fields to any type
export type WithCounts<T> = T & Record<`${string}_count`, number>

// Create database input types
export type CreateInput<T extends keyof Tables> = Database['public']['Tables'][T]['Insert']
export type UpdateInput<T extends keyof Tables> = Database['public']['Tables'][T]['Update']

// ID conversion utilities
export const toEntityId = (id: string | number): number => 
  typeof id === 'string' ? parseInt(id, 10) : id
```

## 🎨 Best Practices

1. **Use enums for status values** instead of string unions
2. **Extend database types** rather than redefining them
3. **Group related types** in the same domain file
4. **Export through index.ts** for clean imports
5. **Keep forms and API types separate** from entity types
6. **Use branded types** for ID safety when needed

## 🔄 Regenerating Database Types

Run this command to update database types from Supabase:
```bash
npm run types:supabase
```

This will regenerate `database.ts` with the latest schema changes.
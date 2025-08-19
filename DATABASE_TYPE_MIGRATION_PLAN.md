# Database Type Migration Plan

## Overview

This document outlines a systematic approach to migrate from ad hoc type definitions to leveraging the comprehensive `src/types/database.ts` types generated from your Supabase schema.

## Current State Analysis

### ✅ Good Examples (Keep These Patterns)
- `src/types/utils.ts` - Excellent utilities that extend database types
- `src/types/domains/company.ts` - Proper use of `DatabaseRow<'table_name'>` pattern
- Some services properly importing database types

### ❌ Problem Areas (Need Migration)
- `src/types/assessment.ts` - 347 lines of ad hoc types duplicating database schema
- `src/types/questionnaire.ts` - Mixed approach with type inconsistencies
- `src/types/company.ts` - Legacy file with complete ad hoc definitions
- ID type mismatches (`string` vs `number`) throughout codebase

## Migration Strategy

Work from simple to complex, ensuring each step builds on the previous ones without breaking existing functionality.

---

## TODO LIST - PHASE 1: FOUNDATION (Simple Tasks)

### ☐ Task 1.1: Fix Critical ID Type Mismatches
**Complexity**: Low | **Impact**: High | **Effort**: 2 hours

**Files to Update**:
- `src/types/assessment.ts` - Change `questionnaire_id: string` to `number` (lines 8, 260)
- `src/types/questionnaire.ts` - Change all string IDs to numbers where database uses auto-increment
- Update any components/hooks that pass these IDs

**Validation**: 
- Run `npm run typecheck` 
- Search for TypeScript errors related to ID mismatches

### ☐ Task 1.2: Create Database Type Aliases
**Complexity**: Low | **Impact**: Medium | **Effort**: 1 hour

**Action**: Add to `src/types/utils.ts`:
```typescript
// Assessment-related database types
export type DatabaseAssessment = DatabaseRow<'assessments'>
export type DatabaseInterview = DatabaseRow<'interviews'>
export type DatabaseInterviewResponse = DatabaseRow<'interview_responses'>
export type DatabaseAssessmentObjective = DatabaseRow<'assessment_objectives'>

// Questionnaire-related database types  
export type DatabaseQuestionnaire = DatabaseRow<'questionnaires'>
export type DatabaseQuestionnaireSection = DatabaseRow<'questionnaire_sections'>
export type DatabaseQuestionnaireStep = DatabaseRow<'questionnaire_steps'>
export type DatabaseQuestionnaireQuestion = DatabaseRow<'questionnaire_questions'>
export type DatabaseQuestionnaireRatingScale = DatabaseRow<'questionnaire_rating_scales'>
```

**Validation**: Import these in a test file to ensure they resolve correctly

### ☐ Task 1.3: Update Import Statements
**Complexity**: Low | **Impact**: Low | **Effort**: 1 hour

**Action**: Update files that import from problematic type files:
- Find all imports from `src/types/assessment.ts`
- Find all imports from old `src/types/company.ts` 
- Prepare to redirect to database-derived types

**Validation**: Use IDE "Find References" to track import usage

---

## TODO LIST - PHASE 2: CORE MIGRATIONS (Medium Tasks)

### ☐ Task 2.1: Migrate Assessment Types
**Complexity**: Medium | **Impact**: High | **Effort**: 3 hours

**Action**: Replace `src/types/assessment.ts` content:

1. **Replace Core Types**:
```typescript
// Replace this:
export interface Assessment {
  id: number;
  created_at: string;
  // ... ad hoc fields
}

// With this:
export interface Assessment extends DatabaseAssessment {
  // Only add computed/UI fields here
  interview_count?: number;
  questionnaire_name?: string;
}
```

2. **Update Extended Types**:
- Convert `AssessmentWithCounts` to use `WithCounts<DatabaseAssessment, 'interview' | 'response'>`
- Convert `CreateAssessmentData` to use `CreateInput<'assessments'>`
- Convert `UpdateAssessmentData` to use `UpdateInput<'assessments'>`

**Files to Update After**:
- All components importing assessment types
- Assessment-related services
- Assessment hooks (`useAssessments.ts`)

**Validation**: 
- `npm run typecheck`
- Test assessment creation/editing flows

### ☐ Task 2.2: Migrate Interview Types  
**Complexity**: Medium | **Impact**: High | **Effort**: 2 hours

**Action**: Follow same pattern as assessments for interview-related types

**Key Changes**:
```typescript
export interface Interview extends DatabaseInterview {
  // Add computed fields only
  average_score?: number;
  completion_rate?: number;
}

export interface InterviewResponse extends DatabaseInterviewResponse {
  // Add relations/computed fields
  question?: QuestionnaireQuestion;
  actions?: InterviewResponseAction[];
}
```

**Validation**: Test interview workflows still function

### ☐ Task 2.3: Migrate Questionnaire Types
**Complexity**: Medium | **Impact**: High | **Effort**: 2 hours

**Action**: Replace ad hoc questionnaire types in `src/types/questionnaire.ts`

**Key Focus Areas**:
- Fix ID type mismatches (string → number)
- Use database types as base, extend for UI needs
- Maintain backward compatibility with existing component props

---

## TODO LIST - PHASE 3: INTEGRATION (Complex Tasks)

### ☐ Task 3.1: Update Service Layer
**Complexity**: Medium-High | **Impact**: Medium | **Effort**: 3 hours

**Files to Update**:
- `src/lib/supabase/questionnaire-service.ts`
- Assessment-related services
- Any service files with type imports

**Action**: 
- Replace ad hoc type imports with database types
- Update function signatures to use `CreateInput<>` and `UpdateInput<>` types
- Ensure API calls match database schema expectations

**Validation**: Test all CRUD operations for each entity type

### ☐ Task 3.2: Update React Components
**Complexity**: High | **Impact**: Medium | **Effort**: 4 hours

**Strategy**: Update component props to use database-derived types

**Priority Files** (based on frequency of type usage):
1. `src/components/interview/` - Interview-related components
2. `src/pages/assessments/` - Assessment pages
3. `src/pages/questionnaires/` - Questionnaire pages

**Action Pattern**:
```typescript
// Replace:
interface Props {
  assessment: Assessment; // ad hoc type
}

// With:
interface Props {
  assessment: DatabaseAssessment & { 
    questionnaire_name?: string; // computed fields only
  };
}
```

### ☐ Task 3.3: Update Hook Definitions
**Complexity**: High | **Impact**: Medium | **Effort**: 2 hours

**Files to Update**:
- `src/hooks/useAssessments.ts`
- `src/hooks/useQuestionnaires.ts`  
- `src/hooks/useInterview.ts`

**Action**: Update return types and parameters to use database types

---

## TODO LIST - PHASE 4: OPTIMIZATION (Advanced Tasks)

### ☐ Task 4.1: Create Domain-Specific Extensions
**Complexity**: High | **Impact**: Medium | **Effort**: 3 hours

**Action**: Create organized domain files similar to `src/types/domains/company.ts`:

- `src/types/domains/assessment.ts`
- `src/types/domains/interview.ts`
- Move logic from old files to these domain-specific files

### ☐ Task 4.2: Remove Legacy Type Files
**Complexity**: Low | **Impact**: Low | **Effort**: 1 hour

**Action**: After migration is complete:
- Delete `src/types/assessment.ts`
- Delete old `src/types/company.ts`
- Clean up any unused imports

**Validation**: Full application test to ensure no broken imports

### ☐ Task 4.3: Add Runtime Validation
**Complexity**: High | **Impact**: Low | **Effort**: 2 hours

**Action**: Create Zod schemas that match database types for runtime validation
- Useful for form validation
- API response validation
- Development-time debugging

---

## Progress Tracking

### Completion Checklist
- [ ] **Phase 1 Complete**: Foundation laid, critical ID mismatches fixed
- [ ] **Phase 2 Complete**: Core entity types migrated to database schema  
- [ ] **Phase 3 Complete**: Services and components updated
- [ ] **Phase 4 Complete**: Optimized and cleaned up

### Success Metrics
- [ ] `npm run typecheck` passes without type-related errors
- [ ] All CRUD operations work correctly
- [ ] No runtime errors related to type mismatches
- [ ] Reduced duplicate type definitions by >80%
- [ ] Improved IDE intellisense for database fields

### Rollback Plan
If any phase causes issues:
1. Revert the specific file changes
2. Keep database type utilities in `utils.ts`
3. Complete current phase before moving to next
4. Each task is designed to be independently reversible

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 | 1 day | None |
| Phase 2 | 2-3 days | Phase 1 complete |
| Phase 3 | 2-3 days | Phase 2 complete |
| Phase 4 | 1-2 days | Phase 3 complete |

**Total Estimated Time**: 1-2 weeks (depending on testing and validation time)

---

## Notes

- **Always run `npm run typecheck` after each task**
- **Test critical user flows after each phase**
- **Consider creating a branch for this migration work**
- **Each task is designed to be atomic and reversible**

Remember: The goal is not just to use database types, but to create a more maintainable and type-safe codebase that automatically stays in sync with your database schema changes.
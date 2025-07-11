/**
 * Types Index
 * Barrel export file for clean imports across the application
 * 
 * Usage:
 * import { Assessment, CreateAssessmentData } from '@/types'
 * import { LoginRequest, ApiResponse } from '@/types'
 */

// Utilities
export * from './utils'

// Domain types
export * from './domains/auth'
export * from './domains/assessment'
export * from './domains/company'
export * from './domains/questionnaire'
export * from './domains/analytics'
export * from './domains/ui'
export * from './domains/app'
export * from './domains/welcome'
export * from './domains/shared-roles'

// API types
export * from './api/requests'
export * from './api/responses'
export * from './api/filters'
/**
 * Type Utilities and Helpers
 * Common type utilities used throughout the application
 */

import type { Database } from './database'

// Database table helper types
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Generic CRUD input types
export type CreateInput<T extends keyof Tables> = Tables[T]['Insert']
export type UpdateInput<T extends keyof Tables> = Tables[T]['Update']
export type DatabaseRow<T extends keyof Tables> = Tables[T]['Row']

// Add count fields to any type
export type WithCounts<T, K extends string = string> = T & {
  [P in `${K}_count`]: number
}

// Add relations to any type
export type WithRelations<T, R extends Record<string, any>> = T & R

// Make specific fields optional
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Make specific fields required
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Extract enum values as union type
export type EnumValues<T extends keyof Enums> = Enums[T]

// ID type utilities
export type EntityId = number // All our database IDs are auto-increment numbers

/**
 * Convert string or number ID to EntityId (number)
 * Useful for handling URL params that come as strings
 */
export const toEntityId = (id: string | number): EntityId => {
  if (typeof id === 'number') return id
  const parsed = parseInt(id, 10)
  if (isNaN(parsed)) throw new Error(`Invalid ID: ${id}`)
  return parsed
}

/**
 * Convert EntityId to string for URL params
 */
export const toStringId = (id: EntityId): string => id.toString()

// Common filter utilities
export interface BaseFilters {
  search?: string
  limit?: number
  offset?: number
}

export interface DateRangeFilter {
  date_range?: {
    start: string
    end: string
  }
}

export interface StatusFilter<T extends string> {
  status?: T[]
}

// Pagination types
export interface PaginationParams {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// Form state types
export interface FormState<T = any> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isDirty: boolean
}

// Loading state types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface AsyncState<T> extends LoadingState {
  data: T | null
}

// Generic store state pattern
export interface StoreState<T> {
  items: T[]
  selectedItem: T | null
  filters: BaseFilters
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  error: string | null
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  'data-testid'?: string
}

export interface ChildrenProps {
  children: React.ReactNode
}

// Generic event handlers
export type EventHandler<T = any> = (event: T) => void
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>

// Utility type for making all properties of an object optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Utility type for making all properties of an object required recursively
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}
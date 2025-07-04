/**
 * UI Component and Interface Types
 * All types related to user interface components, navigation, and UI state
 */

import type { ReactNode } from 'react'

// Base component props
export interface BaseComponentProps {
  className?: string
  'data-testid'?: string
  id?: string
}

export interface ChildrenProps {
  children: ReactNode
}

// Loading and async states
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface AsyncState<T> extends LoadingState {
  data: T | null
}

export interface AsyncOperationState {
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
}

// Form states
export interface FormState<T = any> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
}

export interface FormFieldState {
  value: any
  error?: string
  touched: boolean
  dirty: boolean
}

// Data table types
export interface DataTableColumn<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: number
  align?: 'left' | 'center' | 'right'
}

export interface DataTableConfig<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  error?: string
  pagination?: PaginationConfig
  sorting?: SortingConfig
  filtering?: FilteringConfig
  selection?: SelectionConfig<T>
  actions?: TableAction<T>[]
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  pageSizeOptions?: number[]
}

export interface SortingConfig {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  multiSort?: boolean
}

export interface FilteringConfig {
  globalFilter?: string
  columnFilters?: Record<string, any>
  quickFilters?: QuickFilter[]
}

export interface SelectionConfig<T> {
  selectedRows: T[]
  onSelectionChange: (selected: T[]) => void
  selectAll?: boolean
  getRowId?: (row: T) => string
}

export interface TableAction<T> {
  id: string
  label: string
  icon?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  onClick: (row: T) => void
  isVisible?: (row: T) => boolean
  isDisabled?: (row: T) => boolean
}

export interface QuickFilter {
  id: string
  label: string
  value: any
  active: boolean
}

// Navigation types
export interface NavigationItem {
  id: string
  label: string
  href?: string
  icon?: string
  badge?: string | number
  children?: NavigationItem[]
  isActive?: boolean
  isDisabled?: boolean
  onClick?: () => void
}

export interface BreadcrumbItem {
  id: string
  label: string
  href?: string
  isActive?: boolean
}

export interface TabItem {
  id: string
  label: string
  content?: ReactNode
  badge?: string | number
  isDisabled?: boolean
  href?: string
}

// Modal and dialog types
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnEscape?: boolean
  closeOnOutsideClick?: boolean
}

export interface ConfirmDialogProps extends ModalProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

// Notification types
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface NotificationState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

// Layout types
export interface LayoutProps extends ChildrenProps {
  header?: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
  className?: string
}

export interface SidebarProps extends BaseComponentProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  navigation: NavigationItem[]
  footer?: ReactNode
}

// Theme and appearance
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  fontSize: 'sm' | 'md' | 'lg'
  borderRadius: 'none' | 'sm' | 'md' | 'lg'
  animations: boolean
}

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  destructive: string
  success: string
  warning: string
  info: string
}

// Search and filtering UI
export interface SearchConfig {
  placeholder?: string
  debounceMs?: number
  minLength?: number
  showClearButton?: boolean
  showSearchIcon?: boolean
}

export interface FilterPanelProps extends BaseComponentProps {
  filters: FilterGroup[]
  values: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
  onReset?: () => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export interface FilterGroup {
  id: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text' | 'boolean'
  options?: FilterOption[]
  placeholder?: string
  required?: boolean
}

export interface FilterOption {
  value: any
  label: string
  disabled?: boolean
}

// Card and content types
export interface CardProps extends BaseComponentProps {
  title?: string
  description?: string
  header?: ReactNode
  footer?: ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export interface StatsCardProps extends CardProps {
  value: string | number
  label: string
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period?: string
  }
  icon?: string
  color?: string
}

// Chart wrapper types
export interface ChartWrapperProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  loading?: boolean
  error?: string
  height?: number
  responsive?: boolean
  showExport?: boolean
  onExport?: (format: 'png' | 'pdf' | 'csv') => void
}

// Form component types
export interface FormFieldProps extends BaseComponentProps {
  label?: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

export interface SelectProps extends FormFieldProps {
  options: SelectOption[]
  value?: any
  onValueChange: (value: any) => void
  placeholder?: string
  searchable?: boolean
  multiple?: boolean
  clearable?: boolean
}

export interface SelectOption {
  value: any
  label: string
  disabled?: boolean
  group?: string
}

// Status and badge types
export interface StatusBadgeProps extends BaseComponentProps {
  status: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export interface ProgressProps extends BaseComponentProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

// Event handler types
export type EventHandler<T = any> = (event: T) => void
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>
export type ChangeHandler<T = any> = (value: T) => void

// Generic component state
export interface ComponentState {
  mounted: boolean
  visible: boolean
  disabled: boolean
  loading: boolean
  error: string | null
}

// Responsive design types
export interface Breakpoint {
  name: string
  minWidth: number
  maxWidth?: number
}

export interface ResponsiveConfig<T> {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

// Animation types
export interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
  direction?: 'normal' | 'reverse' | 'alternate'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}

export interface TransitionConfig {
  property: string
  duration: number
  easing: string
  delay?: number
}
import { createClient } from '@/lib/supabase/client';
import { useCompanyStore } from '@/stores/company-store';
import { useAuthStore } from '@/stores/auth-store';

export interface CompanyValidationOptions {
  requireCompanyMatch?: boolean;
  allowDemoAccess?: boolean;
}

export class CompanyAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompanyAccessError';
  }
}

/**
 * Validates that the current user has access to resources belonging to a specific company
 */
export async function validateCompanyAccess(
  resourceCompanyId: number | string,
  options: CompanyValidationOptions = {}
): Promise<boolean> {
  const { requireCompanyMatch = true, allowDemoAccess = true } = options;
  
  const supabase = createClient();
  const { selectedCompany } = useCompanyStore.getState();
  const { isDemoMode } = useAuthStore.getState();

  // No company selected
  if (!selectedCompany) {
    throw new CompanyAccessError('No company selected');
  }

  // Convert IDs to numbers for comparison
  const resourceId = typeof resourceCompanyId === 'string' 
    ? parseInt(resourceCompanyId) 
    : resourceCompanyId;
  
  // Direct match - user is accessing their selected company's data
  if (selectedCompany.id === resourceId) {
    return true;
  }

  // If requireCompanyMatch is false, we're done
  if (!requireCompanyMatch) {
    return true;
  }

  // Demo mode handling
  if (isDemoMode && allowDemoAccess) {
    // In demo mode, check if the resource belongs to a demo company
    const { data: company } = await supabase
      .from('companies')
      .select('is_demo')
      .eq('id', resourceId)
      .single();
    
    if (company?.is_demo) {
      return true;
    }
  }

  // Check if user owns the company
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new CompanyAccessError('Not authenticated');
  }

  const { data: ownedCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('id', resourceId)
    .eq('created_by', user.id)
    .eq('is_deleted', false)
    .single();

  if (!ownedCompany) {
    throw new CompanyAccessError('Access denied to company resources');
  }

  return true;
}

/**
 * Wraps a service method to include company validation
 */
export function withCompanyValidation<T extends (...args: any[]) => Promise<any>>(
  serviceMethod: T,
  getCompanyId: (args: Parameters<T>) => number | string | undefined
): T {
  return (async (...args: Parameters<T>) => {
    const companyId = getCompanyId(args);
    
    if (companyId) {
      await validateCompanyAccess(companyId);
    }
    
    return serviceMethod(...args);
  }) as T;
}

/**
 * Adds company_id filter to Supabase queries based on selected company
 */
export function addCompanyFilter(query: any, fieldName = 'company_id'): any {
  const { selectedCompany } = useCompanyStore.getState();
  
  if (!selectedCompany) {
    throw new CompanyAccessError('No company selected');
  }
  
  return query.eq(fieldName, selectedCompany.id);
}
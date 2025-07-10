import { InterviewService } from './interview-service';
import { CompanyAccessError, validateCompanyAccess } from './middleware/company-validation';
import { useCompanyStore } from '@/stores/company-store';
import type { InterviewWithResponses } from '@/types/interview';

/**
 * Enhanced InterviewService with company validation
 * This wrapper ensures users can only access interviews from their selected company
 */
export class EnhancedInterviewService extends InterviewService {
  /**
   * Override getInterviewById to add company validation
   */
  async getInterviewById(id: string): Promise<InterviewWithResponses | null> {
    // First, fetch the interview to check its company
    const { data: interview, error } = await this.supabase
      .from('interviews')
      .select('company_id')
      .eq('id', id)
      .single();

    if (error || !interview) {
      throw new Error('Interview not found');
    }

    // Validate company access
    try {
      await validateCompanyAccess(interview.company_id);
    } catch (error) {
      if (error instanceof CompanyAccessError) {
        // Instead of throwing, return null to indicate no access
        // This prevents exposing that the resource exists
        return null;
      }
      throw error;
    }

    // If validation passes, fetch the full interview
    return super.getInterviewById(id);
  }

  /**
   * Override getInterviews to ensure company filtering
   */
  async getInterviews(filters?: any) {
    const { selectedCompany } = useCompanyStore.getState();
    
    if (!selectedCompany) {
      throw new CompanyAccessError('No company selected');
    }

    // Always include company filter
    const enhancedFilters = {
      ...filters,
      company_id: selectedCompany.id
    };

    return super.getInterviews(enhancedFilters);
  }

  /**
   * Override createInterview to ensure company_id matches selected company
   */
  async createInterview(interviewData: any) {
    const { selectedCompany } = useCompanyStore.getState();
    
    if (!selectedCompany) {
      throw new CompanyAccessError('No company selected');
    }

    // Force company_id to be the selected company
    const enhancedData = {
      ...interviewData,
      company_id: selectedCompany.id
    };

    return super.createInterview(enhancedData);
  }

  /**
   * Override updateInterview to validate company access
   */
  async updateInterview(id: string, updates: any) {
    // Fetch the interview to check its company
    const { data: interview, error } = await this.supabase
      .from('interviews')
      .select('company_id')
      .eq('id', id)
      .single();

    if (error || !interview) {
      throw new Error('Interview not found');
    }

    // Validate company access
    await validateCompanyAccess(interview.company_id);

    // Prevent changing company_id
    const { company_id, ...safeUpdates } = updates;
    
    return super.updateInterview(id, safeUpdates);
  }

  /**
   * Override deleteInterview to validate company access
   */
  async deleteInterview(id: string) {
    // Fetch the interview to check its company
    const { data: interview, error } = await this.supabase
      .from('interviews')
      .select('company_id')
      .eq('id', id)
      .single();

    if (error || !interview) {
      throw new Error('Interview not found');
    }

    // Validate company access
    await validateCompanyAccess(interview.company_id);

    return super.deleteInterview(id);
  }
}

// Export a singleton instance
export const interviewService = new EnhancedInterviewService();
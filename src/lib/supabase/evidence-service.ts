import { createClient } from "./client";
import { checkDemoAction } from "./utils";
import type { Tables, TablesInsert } from "@/types/database";

export type InterviewEvidence = Tables<"interview_evidence">;
export type CreateEvidenceData = TablesInsert<"interview_evidence">;

export interface EvidenceUploadResult {
  evidence: InterviewEvidence;
  publicUrl: string;
}

export class EvidenceService {
  private supabase = createClient();

  // Get evidence bucket name from environment with fallback
  private get bucketName(): string {
    const bucketName = import.meta.env.VITE_SUPABASE_EVIDENCE_BUCKET;
    if (!bucketName) {
      console.warn('VITE_SUPABASE_EVIDENCE_BUCKET not configured, falling back to "temp"');
      return 'temp';
    }
    return bucketName;
  }

  // Allowed file types and their MIME types
  private allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  private allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.csv', '.xls', '.xlsx'];

  // Max file size: 10MB
  private maxFileSize = 10 * 1024 * 1024;

  /**
   * Validate file before upload
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Check file type by extension (more reliable than MIME type)
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type not supported. Allowed types: ${this.allowedExtensions.join(', ')}`
      };
    }

    // Also check MIME type if available
    if (file.type && !this.allowedFileTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not supported. Please use: PDF, DOC, DOCX, JPG, PNG, CSV, XLSX`
      };
    }

    return { isValid: true };
  }

  /**
   * Generate unique file path for storage
   */
  private generateFilePath(responseId: number, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `evidence/${responseId}/${timestamp}-${sanitizedFileName}`;
  }

  /**
   * Upload a single evidence file for an interview response
   */
  async uploadEvidence(
    responseId: number,
    file: File,
    uploadedBy: string
  ): Promise<EvidenceUploadResult> {
    await checkDemoAction();

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      // Generate unique file path
      const filePath = this.generateFilePath(responseId, file.name);

      // Upload to storage
      const { error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          upsert: false // Don't overwrite existing files
        });

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      // Create database record
      const evidenceData: CreateEvidenceData = {
        interview_response_id: responseId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        uploaded_by: uploadedBy
      };

      const { data: evidence, error: dbError } = await this.supabase
        .from('interview_evidence')
        .insert(evidenceData)
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await this.supabase.storage.from(this.bucketName).remove([filePath]);
        throw new Error(`Failed to save evidence record: ${dbError.message}`);
      }

      return {
        evidence,
        publicUrl
      };
    } catch (error) {
      console.error('Error uploading evidence:', error);
      throw error;
    }
  }

  /**
   * Get all evidence files for an interview response
   */
  async getEvidenceForResponse(responseId: number): Promise<InterviewEvidence[]> {
    try {
      const { data: evidence, error } = await this.supabase
        .from('interview_evidence')
        .select('*')
        .eq('interview_response_id', responseId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch evidence: ${error.message}`);
      }

      return evidence || [];
    } catch (error) {
      console.error('Error fetching evidence for response:', error);
      throw error;
    }
  }

  /**
   * Delete an evidence file (both from storage and database)
   */
  async deleteEvidence(evidenceId: number): Promise<void> {
    await checkDemoAction();

    try {
      // First get the evidence record to get file path
      const { data: evidence, error: fetchError } = await this.supabase
        .from('interview_evidence')
        .select('file_path')
        .eq('id', evidenceId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to find evidence record: ${fetchError.message}`);
      }

      if (!evidence) {
        throw new Error('Evidence record not found');
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from(this.bucketName)
        .remove([evidence.file_path]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError.message);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete database record
      const { error: dbError } = await this.supabase
        .from('interview_evidence')
        .delete()
        .eq('id', evidenceId);

      if (dbError) {
        throw new Error(`Failed to delete evidence record: ${dbError.message}`);
      }
    } catch (error) {
      console.error('Error deleting evidence:', error);
      throw error;
    }
  }

  /**
   * Get public URL for an evidence file
   */
  getPublicUrl(filePath: string): string {
    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    
    return publicUrl;
  }

  /**
   * Check if file exists in storage
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(filePath.substring(0, filePath.lastIndexOf('/')), {
          limit: 1,
          search: filePath.substring(filePath.lastIndexOf('/') + 1)
        });

      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  }
}

export const evidenceService = new EvidenceService();
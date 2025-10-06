export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      assessment_objectives: {
        Row: {
          assessment_id: number;
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean;
          title: string;
          updated_at: string;
        };
        Insert: {
          assessment_id: number;
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          title: string;
          updated_at?: string;
        };
        Update: {
          assessment_id?: number;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_objectives_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_objectives_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      assessments: {
        Row: {
          asset_group_id: number | null;
          business_unit_id: number | null;
          company_id: string;
          completed_at: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean;
          name: string;
          questionnaire_id: number;
          region_id: number | null;
          scheduled_at: string | null;
          site_id: number | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["assessment_statuses"];
          type: Database["public"]["Enums"]["assessment_types"];
          updated_at: string;
        };
        Insert: {
          asset_group_id?: number | null;
          business_unit_id?: number | null;
          company_id: string;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name: string;
          questionnaire_id: number;
          region_id?: number | null;
          scheduled_at?: string | null;
          site_id?: number | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["assessment_statuses"];
          type: Database["public"]["Enums"]["assessment_types"];
          updated_at?: string;
        };
        Update: {
          asset_group_id?: number | null;
          business_unit_id?: number | null;
          company_id?: string;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name?: string;
          questionnaire_id?: number;
          region_id?: number | null;
          scheduled_at?: string | null;
          site_id?: number | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["assessment_statuses"];
          type?: Database["public"]["Enums"]["assessment_types"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessments_asset_group_id_fkey";
            columns: ["asset_group_id"];
            isOneToOne: false;
            referencedRelation: "asset_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessments_business_unit_id_fkey";
            columns: ["business_unit_id"];
            isOneToOne: false;
            referencedRelation: "business_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessments_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessments_questionnaire_id_fkey";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "questionnaires";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessments_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessments_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
        ];
      };
      asset_group_contacts: {
        Row: {
          asset_group_id: number;
          company_id: string;
          contact_id: number;
          created_at: string;
          created_by: string;
        };
        Insert: {
          asset_group_id: number;
          company_id: string;
          contact_id: number;
          created_at?: string;
          created_by?: string;
        };
        Update: {
          asset_group_id?: number;
          company_id?: string;
          contact_id?: number;
          created_at?: string;
          created_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_group_contacts_asset_group_id_fkey";
            columns: ["asset_group_id"];
            isOneToOne: false;
            referencedRelation: "asset_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_group_contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_group_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
        ];
      };
      asset_groups: {
        Row: {
          asset_type: string | null;
          code: string | null;
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean | null;
          name: string;
          site_id: number;
          updated_at: string;
        };
        Insert: {
          asset_type?: string | null;
          code?: string | null;
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean | null;
          name: string;
          site_id: number;
          updated_at?: string;
        };
        Update: {
          asset_type?: string | null;
          code?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean | null;
          name?: string;
          site_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_groups_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_groups_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
        ];
      };
      business_unit_contacts: {
        Row: {
          business_unit_id: number;
          company_id: string;
          contact_id: number;
          created_at: string;
          created_by: string;
        };
        Insert: {
          business_unit_id: number;
          company_id: string;
          contact_id: number;
          created_at?: string;
          created_by?: string;
        };
        Update: {
          business_unit_id?: number;
          company_id?: string;
          contact_id?: number;
          created_at?: string;
          created_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_unit_contacts_business_unit_id_fkey";
            columns: ["business_unit_id"];
            isOneToOne: false;
            referencedRelation: "business_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_unit_contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_unit_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
        ];
      };
      business_units: {
        Row: {
          code: string | null;
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          code?: string | null;
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_units_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      calculated_metrics: {
        Row: {
          asset_group_id: number | null;
          business_unit_id: number | null;
          calculated_value: number;
          calculation_metadata: Json | null;
          company_id: string;
          created_at: string;
          created_by: string;
          data_source: string | null;
          id: number;
          metric_id: number;
          program_phase_id: number;
          region_id: number | null;
          role_id: number | null;
          site_id: number | null;
          updated_at: string | null;
          work_group_id: number | null;
        };
        Insert: {
          asset_group_id?: number | null;
          business_unit_id?: number | null;
          calculated_value: number;
          calculation_metadata?: Json | null;
          company_id: string;
          created_at?: string;
          created_by?: string;
          data_source?: string | null;
          id?: number;
          metric_id: number;
          program_phase_id: number;
          region_id?: number | null;
          role_id?: number | null;
          site_id?: number | null;
          updated_at?: string | null;
          work_group_id?: number | null;
        };
        Update: {
          asset_group_id?: number | null;
          business_unit_id?: number | null;
          calculated_value?: number;
          calculation_metadata?: Json | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          data_source?: string | null;
          id?: number;
          metric_id?: number;
          program_phase_id?: number;
          region_id?: number | null;
          role_id?: number | null;
          site_id?: number | null;
          updated_at?: string | null;
          work_group_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "calculated_metrics_asset_group_id_fkey";
            columns: ["asset_group_id"];
            isOneToOne: false;
            referencedRelation: "asset_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calculated_metrics_business_unit_id_fkey";
            columns: ["business_unit_id"];
            isOneToOne: false;
            referencedRelation: "business_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calculated_metrics_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calculated_metrics_metric_id_fkey";
            columns: ["metric_id"];
            isOneToOne: false;
            referencedRelation: "metric_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calculated_metrics_program_phase_id_fkey";
            columns: ["program_phase_id"];
            isOneToOne: false;
            referencedRelation: "program_phases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calculated_metrics_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calculated_metrics_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calculated_metrics_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calculated_metrics_work_group_id_fkey";
            columns: ["work_group_id"];
            isOneToOne: false;
            referencedRelation: "work_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          code: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          icon_url: string | null;
          id: string;
          is_deleted: boolean;
          is_demo: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          is_deleted?: boolean;
          is_demo?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          is_deleted?: boolean;
          is_demo?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      company_contacts: {
        Row: {
          company_id: string;
          contact_id: number;
          created_at: string;
          created_by: string;
        };
        Insert: {
          company_id: string;
          contact_id: number;
          created_at?: string;
          created_by?: string;
        };
        Update: {
          company_id?: string;
          contact_id?: number;
          created_at?: string;
          created_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          email: string;
          full_name: string;
          id: number;
          is_deleted: boolean;
          phone: string | null;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          email: string;
          full_name: string;
          id?: number;
          is_deleted?: boolean;
          phone?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          email?: string;
          full_name?: string;
          id?: number;
          is_deleted?: boolean;
          phone?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      dashboards: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          id: number;
          is_deleted: boolean;
          layout: Json;
          name: string;
          updated_at: string;
          widgets: Json;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: number;
          is_deleted?: boolean;
          layout?: Json;
          name: string;
          updated_at?: string;
          widgets?: Json;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: number;
          is_deleted?: boolean;
          layout?: Json;
          name?: string;
          updated_at?: string;
          widgets?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "dashboards_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback: {
        Row: {
          created_at: string;
          created_by: string;
          id: number;
          message: string;
          page_url: string;
          type: Database["public"]["Enums"]["feedback_types"];
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          id?: number;
          message: string;
          page_url: string;
          type?: Database["public"]["Enums"]["feedback_types"];
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: number;
          message?: string;
          page_url?: string;
          type?: Database["public"]["Enums"]["feedback_types"];
        };
        Relationships: [];
      };
      interview_evidence: {
        Row: {
          company_id: string;
          created_at: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          id: number;
          interview_id: number;
          interview_response_id: number;
          uploaded_at: string;
          uploaded_by: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          id?: number;
          interview_id: number;
          interview_response_id: number;
          uploaded_at?: string;
          uploaded_by?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          id?: number;
          interview_id?: number;
          interview_response_id?: number;
          uploaded_at?: string;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_evidence_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_evidence_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_evidence_interview_response_id_fkey";
            columns: ["interview_response_id"];
            isOneToOne: false;
            referencedRelation: "interview_responses";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_question_applicable_roles: {
        Row: {
          company_id: string;
          created_at: string;
          id: number;
          interview_id: number;
          is_universal: boolean | null;
          questionnaire_question_id: number;
          role_id: number | null;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          id?: number;
          interview_id: number;
          is_universal?: boolean | null;
          questionnaire_question_id: number;
          role_id?: number | null;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          id?: number;
          interview_id?: number;
          is_universal?: boolean | null;
          questionnaire_question_id?: number;
          role_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "interview_question_applicable_ro_questionnaire_question_id_fkey";
            columns: ["questionnaire_question_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_question_applicable_roles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_question_applicable_roles_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_question_applicable_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_questions: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string;
          id: number;
          interview_id: number;
          questionnaire_question_id: number;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          interview_id: number;
          questionnaire_question_id: number;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          interview_id?: number;
          questionnaire_question_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "interview_questions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_questions_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_questions_questionnaire_question_id_fkey";
            columns: ["questionnaire_question_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_response_actions: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string;
          id: number;
          interview_id: number;
          interview_response_id: number;
          is_deleted: boolean;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description: string;
          id?: number;
          interview_id: number;
          interview_response_id: number;
          is_deleted?: boolean;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string;
          id?: number;
          interview_id?: number;
          interview_response_id?: number;
          is_deleted?: boolean;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_response_actions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_response_actions_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_response_actions_interview_response_id_fkey";
            columns: ["interview_response_id"];
            isOneToOne: false;
            referencedRelation: "interview_responses";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_response_roles: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string | null;
          id: number;
          interview_id: number;
          interview_response_id: number;
          role_id: number;
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: number;
          interview_id: number;
          interview_response_id: number;
          role_id: number;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: number;
          interview_id?: number;
          interview_response_id?: number;
          role_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_response_roles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_response_roles_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_response_roles_interview_response_id_fkey";
            columns: ["interview_response_id"];
            isOneToOne: false;
            referencedRelation: "interview_responses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_response_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_responses: {
        Row: {
          answered_at: string | null;
          comments: string | null;
          company_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          id: number;
          interview_id: number;
          is_applicable: boolean;
          is_deleted: boolean;
          questionnaire_question_id: number;
          rating_score: number | null;
          updated_at: string;
        };
        Insert: {
          answered_at?: string | null;
          comments?: string | null;
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: number;
          interview_id: number;
          is_applicable?: boolean;
          is_deleted?: boolean;
          questionnaire_question_id: number;
          rating_score?: number | null;
          updated_at?: string;
        };
        Update: {
          answered_at?: string | null;
          comments?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: number;
          interview_id?: number;
          is_applicable?: boolean;
          is_deleted?: boolean;
          questionnaire_question_id?: number;
          rating_score?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_responses_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_responses_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_responses_questionnaire_question_id_fkey";
            columns: ["questionnaire_question_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_roles: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string | null;
          id: number;
          interview_id: number;
          role_id: number;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: number;
          interview_id: number;
          role_id: number;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: number;
          interview_id?: number;
          role_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "interview_roles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_roles_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_sections: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string;
          id: number;
          interview_id: number;
          questionnaire_section_id: number;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          interview_id: number;
          questionnaire_section_id: number;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          interview_id?: number;
          questionnaire_section_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "interview_sections_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_sections_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_sections_questionnaire_section_id_fkey";
            columns: ["questionnaire_section_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_steps: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string;
          id: number;
          interview_id: number;
          questionnaire_step_id: number;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by: string;
          id?: number;
          interview_id: number;
          questionnaire_step_id: number;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          interview_id?: number;
          questionnaire_step_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "interview_steps_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_steps_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_steps_questionnaire_step_id_fkey";
            columns: ["questionnaire_step_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_steps";
            referencedColumns: ["id"];
          },
        ];
      };
      interviews: {
        Row: {
          access_code: string | null;
          assessment_id: number | null;
          assigned_role_id: number | null;
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          enabled: boolean;
          id: number;
          interview_contact_id: number | null;
          interviewer_id: string | null;
          is_deleted: boolean;
          is_public: boolean;
          name: string;
          notes: string | null;
          program_id: number | null;
          program_phase_id: number | null;
          questionnaire_id: number | null;
          status: Database["public"]["Enums"]["interview_statuses"];
          updated_at: string;
        };
        Insert: {
          access_code?: string | null;
          assessment_id?: number | null;
          assigned_role_id?: number | null;
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          enabled?: boolean;
          id?: number;
          interview_contact_id?: number | null;
          interviewer_id?: string | null;
          is_deleted?: boolean;
          is_public?: boolean;
          name?: string;
          notes?: string | null;
          program_id?: number | null;
          program_phase_id?: number | null;
          questionnaire_id?: number | null;
          status?: Database["public"]["Enums"]["interview_statuses"];
          updated_at?: string;
        };
        Update: {
          access_code?: string | null;
          assessment_id?: number | null;
          assigned_role_id?: number | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          enabled?: boolean;
          id?: number;
          interview_contact_id?: number | null;
          interviewer_id?: string | null;
          is_deleted?: boolean;
          is_public?: boolean;
          name?: string;
          notes?: string | null;
          program_id?: number | null;
          program_phase_id?: number | null;
          questionnaire_id?: number | null;
          status?: Database["public"]["Enums"]["interview_statuses"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interviews_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_assigned_role_id_fkey";
            columns: ["assigned_role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_interview_contact_id_fkey";
            columns: ["interview_contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_interviewer_id_fkey";
            columns: ["interviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_program_phase_id_fkey";
            columns: ["program_phase_id"];
            isOneToOne: false;
            referencedRelation: "program_phases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_questionnaire_id_fkey";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "questionnaires";
            referencedColumns: ["id"];
          },
        ];
      };
      metric_alignments: {
        Row: {
          alignment_level:
            | Database["public"]["Enums"]["metric_alignment_levels"]
            | null;
          calculated_metric_id: number;
          company_id: string;
          created_at: string;
          created_by: string;
          id: number;
          program_id: number;
          questionnaire_question_id: number | null;
          questionnaire_section_id: number | null;
          questionnaire_step_id: number | null;
          updated_at: string;
        };
        Insert: {
          alignment_level?:
            | Database["public"]["Enums"]["metric_alignment_levels"]
            | null;
          calculated_metric_id: number;
          company_id: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          program_id: number;
          questionnaire_question_id?: number | null;
          questionnaire_section_id?: number | null;
          questionnaire_step_id?: number | null;
          updated_at?: string;
        };
        Update: {
          alignment_level?:
            | Database["public"]["Enums"]["metric_alignment_levels"]
            | null;
          calculated_metric_id?: number;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          program_id?: number;
          questionnaire_question_id?: number | null;
          questionnaire_section_id?: number | null;
          questionnaire_step_id?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "metric_alignments_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "metric_alignments_questionnaire_question_id_fkey";
            columns: ["questionnaire_question_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "metric_alignments_questionnaire_section_id_fkey";
            columns: ["questionnaire_section_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_sections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "metric_alignments_questionnaire_step_id_fkey";
            columns: ["questionnaire_step_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_steps";
            referencedColumns: ["id"];
          },
        ];
      };
      metric_definitions: {
        Row: {
          calculation: string | null;
          calculation_type: string | null;
          created_at: string;
          description: string | null;
          id: number;
          name: string;
          objective: string | null;
          provider: Database["public"]["Enums"]["metric_providers"] | null;
          required_csv_columns: Json | null;
          updated_at: string;
        };
        Insert: {
          calculation?: string | null;
          calculation_type?: string | null;
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
          objective?: string | null;
          provider?: Database["public"]["Enums"]["metric_providers"] | null;
          required_csv_columns?: Json | null;
          updated_at?: string;
        };
        Update: {
          calculation?: string | null;
          calculation_type?: string | null;
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
          objective?: string | null;
          provider?: Database["public"]["Enums"]["metric_providers"] | null;
          required_csv_columns?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          is_admin: boolean;
          is_internal: boolean;
          onboarded: boolean;
          onboarded_at: string | null;
          subscription_features: Json;
          subscription_tier: Database["public"]["Enums"]["subscription_tier_enum"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          is_admin?: boolean;
          is_internal?: boolean;
          onboarded?: boolean;
          onboarded_at?: string | null;
          subscription_features?: Json;
          subscription_tier?: Database["public"]["Enums"]["subscription_tier_enum"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          is_admin?: boolean;
          is_internal?: boolean;
          onboarded?: boolean;
          onboarded_at?: string | null;
          subscription_features?: Json;
          subscription_tier?: Database["public"]["Enums"]["subscription_tier_enum"];
          updated_at?: string;
        };
        Relationships: [];
      };
      program_metrics: {
        Row: {
          created_at: string;
          created_by: string;
          id: number;
          metric_id: number;
          program_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          id?: number;
          metric_id: number;
          program_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: number;
          metric_id?: number;
          program_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "program_metrics_metric_id_fkey";
            columns: ["metric_id"];
            isOneToOne: false;
            referencedRelation: "metric_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "program_metrics_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      program_objectives: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean;
          name: string;
          program_id: number;
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name: string;
          program_id: number;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name?: string;
          program_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "program_objectives_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "program_objectives_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      program_phases: {
        Row: {
          actual_end_date: string | null;
          actual_start_date: string | null;
          company_id: string;
          created_at: string;
          created_by: string;
          id: number;
          locked_for_analysis_at: string | null;
          name: string | null;
          notes: string | null;
          planned_end_date: string | null;
          planned_start_date: string | null;
          program_id: number;
          sequence_number: number;
          status: Database["public"]["Enums"]["program_phase_status"];
          updated_at: string;
        };
        Insert: {
          actual_end_date?: string | null;
          actual_start_date?: string | null;
          company_id: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          locked_for_analysis_at?: string | null;
          name?: string | null;
          notes?: string | null;
          planned_end_date?: string | null;
          planned_start_date?: string | null;
          program_id: number;
          sequence_number?: number;
          status: Database["public"]["Enums"]["program_phase_status"];
          updated_at?: string;
        };
        Update: {
          actual_end_date?: string | null;
          actual_start_date?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          locked_for_analysis_at?: string | null;
          name?: string | null;
          notes?: string | null;
          planned_end_date?: string | null;
          planned_start_date?: string | null;
          program_id?: number;
          sequence_number?: number;
          status?: Database["public"]["Enums"]["program_phase_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "program_phases_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "program_phases_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      programs: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string;
          current_sequence_number: number;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean;
          is_demo: boolean;
          name: string;
          onsite_questionnaire_id: number | null;
          presite_questionnaire_id: number | null;
          status: Database["public"]["Enums"]["program_statuses"];
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string;
          current_sequence_number?: number;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          is_demo?: boolean;
          name: string;
          onsite_questionnaire_id?: number | null;
          presite_questionnaire_id?: number | null;
          status?: Database["public"]["Enums"]["program_statuses"];
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string;
          current_sequence_number?: number;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          is_demo?: boolean;
          name?: string;
          onsite_questionnaire_id?: number | null;
          presite_questionnaire_id?: number | null;
          status?: Database["public"]["Enums"]["program_statuses"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "programs_presite_questionnaire_id_fkey";
            columns: ["presite_questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "questionnaires";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "programs_questionnaire_id_fkey";
            columns: ["onsite_questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "questionnaires";
            referencedColumns: ["id"];
          },
        ];
      };
      questionnaire_question_rating_scales: {
        Row: {
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string;
          id: number;
          is_deleted: boolean;
          questionnaire_id: number;
          questionnaire_question_id: number;
          questionnaire_rating_scale_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description: string;
          id?: number;
          is_deleted?: boolean;
          questionnaire_id: number;
          questionnaire_question_id: number;
          questionnaire_rating_scale_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string;
          id?: number;
          is_deleted?: boolean;
          questionnaire_id?: number;
          questionnaire_question_id?: number;
          questionnaire_rating_scale_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questionnaire_question_rating_questionnaire_rating_scale_i_fkey";
            columns: ["questionnaire_rating_scale_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_rating_scales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "questionnaire_question_rating_sc_questionnaire_question_id_fkey";
            columns: ["questionnaire_question_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "questionnaire_question_rating_scales_questionnaire_id_fkey";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "questionnaires";
            referencedColumns: ["id"];
          },
        ];
      };
      questionnaire_question_roles: {
        Row: {
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          id: number;
          is_deleted: boolean;
          questionnaire_id: number;
          questionnaire_question_id: number;
          shared_role_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: number;
          is_deleted?: boolean;
          questionnaire_id: number;
          questionnaire_question_id: number;
          shared_role_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: number;
          is_deleted?: boolean;
          questionnaire_id?: number;
          questionnaire_question_id?: number;
          shared_role_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questionnaire_question_roles_questionnaire_id_fkey";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "questionnaires";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "qustionnaire_question_roles_questionnaire_question_id_fkey";
            columns: ["questionnaire_question_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "qustionnaire_question_roles_shared_role_id_fkey";
            columns: ["shared_role_id"];
            isOneToOne: false;
            referencedRelation: "shared_roles";
            referencedColumns: ["id"];
          },
        ];
      };
      questionnaire_questions: {
        Row: {
          context: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          id: number;
          is_deleted: boolean;
          order_index: number;
          question_text: string;
          questionnaire_id: number;
          questionnaire_step_id: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          context?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: number;
          is_deleted?: boolean;
          order_index: number;
          question_text: string;
          questionnaire_id: number;
          questionnaire_step_id: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          context?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: number;
          is_deleted?: boolean;
          order_index?: number;
          question_text?: string;
          questionnaire_id?: number;
          questionnaire_step_id?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questionnaire_questions_questionnaire_id_fkey";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "questionnaires";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "questionnaire_questions_questionnaire_step_id_fkey";
            columns: ["questionnaire_step_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_steps";
            referencedColumns: ["id"];
          },
        ];
      };
      questionnaire_rating_scales: {
        Row: {
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean;
          name: string;
          order_index: number;
          questionnaire_id: number;
          updated_at: string;
          value: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name: string;
          order_index: number;
          questionnaire_id: number;
          updated_at?: string;
          value: number;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name?: string;
          order_index?: number;
          questionnaire_id?: number;
          updated_at?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "questionnaire_rating_scales_questionnaire_id_fkey";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "questionnaires";
            referencedColumns: ["id"];
          },
        ];
      };
      questionnaire_sections: {
        Row: {
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          expanded: boolean;
          id: number;
          is_deleted: boolean;
          order_index: number;
          questionnaire_id: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          expanded: boolean;
          id?: number;
          is_deleted?: boolean;
          order_index: number;
          questionnaire_id: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          expanded?: boolean;
          id?: number;
          is_deleted?: boolean;
          order_index?: number;
          questionnaire_id?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questionnaire_sections_questionnaire_id_fkey";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "questionnaires";
            referencedColumns: ["id"];
          },
        ];
      };
      questionnaire_steps: {
        Row: {
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          expanded: boolean;
          id: number;
          is_deleted: boolean;
          order_index: number;
          questionnaire_id: number;
          questionnaire_section_id: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          expanded?: boolean;
          id?: number;
          is_deleted?: boolean;
          order_index: number;
          questionnaire_id: number;
          questionnaire_section_id: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          expanded?: boolean;
          id?: number;
          is_deleted?: boolean;
          order_index?: number;
          questionnaire_id?: number;
          questionnaire_section_id?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questionnaire_steps_questionnaire_id_fkey";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "questionnaires";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "questionnaire_steps_questionnaire_section_id_fkey";
            columns: ["questionnaire_section_id"];
            isOneToOne: false;
            referencedRelation: "questionnaire_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      questionnaires: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          guidelines: string | null;
          id: number;
          is_deleted: boolean;
          is_demo: boolean;
          name: string;
          status: Database["public"]["Enums"]["questionnaire_statuses"];
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          guidelines?: string | null;
          id?: number;
          is_deleted?: boolean;
          is_demo?: boolean;
          name: string;
          status?: Database["public"]["Enums"]["questionnaire_statuses"];
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          guidelines?: string | null;
          id?: number;
          is_deleted?: boolean;
          is_demo?: boolean;
          name?: string;
          status?: Database["public"]["Enums"]["questionnaire_statuses"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questionnaires_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      recommendations: {
        Row: {
          company_id: string;
          content: string;
          context: string;
          created_at: string;
          deleted_at: string | null;
          id: number;
          is_deleted: boolean;
          priority: Database["public"]["Enums"]["priority"];
          program_id: number | null;
          status: Database["public"]["Enums"]["recommendation_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          company_id: string;
          content: string;
          context: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: number;
          is_deleted?: boolean;
          priority: Database["public"]["Enums"]["priority"];
          program_id?: number | null;
          status?: Database["public"]["Enums"]["recommendation_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          content?: string;
          context?: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: number;
          is_deleted?: boolean;
          priority?: Database["public"]["Enums"]["priority"];
          program_id?: number | null;
          status?: Database["public"]["Enums"]["recommendation_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recommendations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      region_contacts: {
        Row: {
          company_id: string;
          contact_id: number;
          created_at: string;
          created_by: string;
          region_id: number;
        };
        Insert: {
          company_id: string;
          contact_id: number;
          created_at?: string;
          created_by?: string;
          region_id: number;
        };
        Update: {
          company_id?: string;
          contact_id?: number;
          created_at?: string;
          created_by?: string;
          region_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "region_contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "region_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "region_contacts_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
        ];
      };
      regions: {
        Row: {
          business_unit_id: number;
          code: string | null;
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          business_unit_id: number;
          code?: string | null;
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          business_unit_id?: number;
          code?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "regions_business_unit_id_fkey";
            columns: ["business_unit_id"];
            isOneToOne: false;
            referencedRelation: "business_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "regions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      role_contacts: {
        Row: {
          company_id: string;
          contact_id: number;
          created_at: string;
          created_by: string;
          role_id: number;
        };
        Insert: {
          company_id: string;
          contact_id: number;
          created_at?: string;
          created_by?: string;
          role_id: number;
        };
        Update: {
          company_id?: string;
          contact_id?: number;
          created_at?: string;
          created_by?: string;
          role_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "role_contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_contacts_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          code: string | null;
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          id: number;
          is_deleted: boolean;
          level: Database["public"]["Enums"]["role_levels"] | null;
          reports_to_role_id: number | null;
          shared_role_id: number | null;
          updated_at: string;
          work_group_id: number;
        };
        Insert: {
          code?: string | null;
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: number;
          is_deleted?: boolean;
          level?: Database["public"]["Enums"]["role_levels"] | null;
          reports_to_role_id?: number | null;
          shared_role_id?: number | null;
          updated_at?: string;
          work_group_id: number;
        };
        Update: {
          code?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: number;
          is_deleted?: boolean;
          level?: Database["public"]["Enums"]["role_levels"] | null;
          reports_to_role_id?: number | null;
          shared_role_id?: number | null;
          updated_at?: string;
          work_group_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roles_reports_to_role_id_fkey";
            columns: ["reports_to_role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roles_shared_role_id_fkey";
            columns: ["shared_role_id"];
            isOneToOne: false;
            referencedRelation: "shared_roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roles_work_group_id_fkey";
            columns: ["work_group_id"];
            isOneToOne: false;
            referencedRelation: "work_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      shared_roles: {
        Row: {
          company_id: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          company_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shared_roles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      site_contacts: {
        Row: {
          company_id: string;
          contact_id: number;
          created_at: string;
          created_by: string;
          site_id: number;
        };
        Insert: {
          company_id: string;
          contact_id: number;
          created_at?: string;
          created_by?: string;
          site_id: number;
        };
        Update: {
          company_id?: string;
          contact_id?: number;
          created_at?: string;
          created_by?: string;
          site_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "site_contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_contacts_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
        ];
      };
      sites: {
        Row: {
          code: string | null;
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean;
          lat: number | null;
          lng: number | null;
          name: string;
          region_id: number;
          updated_at: string;
        };
        Insert: {
          code?: string | null;
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          lat?: number | null;
          lng?: number | null;
          name: string;
          region_id: number;
          updated_at?: string;
        };
        Update: {
          code?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean;
          lat?: number | null;
          lng?: number | null;
          name?: string;
          region_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sites_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sites_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
        ];
      };
      user_companies: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string;
          id: number;
          role: Database["public"]["Enums"]["company_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          role?: Database["public"]["Enums"]["company_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string;
          id?: number;
          role?: Database["public"]["Enums"]["company_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      work_group_contacts: {
        Row: {
          company_id: string;
          contact_id: number;
          created_at: string;
          created_by: string;
          work_group_id: number;
        };
        Insert: {
          company_id: string;
          contact_id: number;
          created_at?: string;
          created_by?: string;
          work_group_id: number;
        };
        Update: {
          company_id?: string;
          contact_id?: number;
          created_at?: string;
          created_by?: string;
          work_group_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "work_group_contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_group_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_group_contacts_work_group_id_fkey";
            columns: ["work_group_id"];
            isOneToOne: false;
            referencedRelation: "work_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      work_groups: {
        Row: {
          asset_group_id: number;
          code: string | null;
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: number;
          is_deleted: boolean | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          asset_group_id: number;
          code?: string | null;
          company_id: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          asset_group_id?: number;
          code?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          is_deleted?: boolean | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_groups_asset_group_id_fkey";
            columns: ["asset_group_id"];
            isOneToOne: false;
            referencedRelation: "asset_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_groups_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_demo_company: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_min_company_role: {
        Args: {
          check_company_id: string;
          check_role: Database["public"]["Enums"]["company_role"];
        };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_demo_company: {
        Args: { company_id: string };
        Returns: boolean;
      };
      is_demo_mode_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_demo_questionnaire: {
        Args: { questionnaire_id: number };
        Returns: boolean;
      };
      is_interview_contact_public: {
        Args: { contact_id: number };
        Returns: boolean;
      };
      is_interview_public: {
        Args: { interview_id_param: number };
        Returns: boolean;
      };
      is_questionnaire_owner: {
        Args: { q_id: number };
        Returns: boolean;
      };
      is_questionnaire_public: {
        Args: { questionnaire_id: number };
        Returns: boolean;
      };
      is_valid_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      user_companies: {
        Args: Record<PropertyKey, never>;
        Returns: {
          company_id: string;
          role: Database["public"]["Enums"]["company_role"];
        }[];
      };
    };
    Enums: {
      assessment_statuses:
        | "draft"
        | "active"
        | "under_review"
        | "completed"
        | "archived";
      assessment_types: "onsite" | "desktop";
      company_role: "owner" | "admin" | "viewer" | "interviewee";
      feedback_types: "bug" | "feature" | "general" | "suggestion";
      interview_statuses: "pending" | "in_progress" | "completed" | "cancelled";
      metric_alignment_levels: "question" | "step" | "section";
      metric_providers: "SAP" | "other";
      priority: "low" | "medium" | "high";
      program_phase_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "archived";
      program_statuses:
        | "draft"
        | "active"
        | "under_review"
        | "completed"
        | "archived";
      questionnaire_statuses: "draft" | "active" | "under_review" | "archived";
      recommendation_status: "not_started" | "in_progress" | "completed";
      role_levels:
        | "executive"
        | "management"
        | "supervisor"
        | "professional"
        | "technician"
        | "operator"
        | "specialist"
        | "other";
      subscription_tier_enum: "demo" | "consultant" | "enterprise";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      assessment_statuses: [
        "draft",
        "active",
        "under_review",
        "completed",
        "archived",
      ],
      assessment_types: ["onsite", "desktop"],
      company_role: ["owner", "admin", "viewer", "interviewee"],
      feedback_types: ["bug", "feature", "general", "suggestion"],
      interview_statuses: ["pending", "in_progress", "completed", "cancelled"],
      metric_alignment_levels: ["question", "step", "section"],
      metric_providers: ["SAP", "other"],
      priority: ["low", "medium", "high"],
      program_phase_status: [
        "scheduled",
        "in_progress",
        "completed",
        "archived",
      ],
      program_statuses: [
        "draft",
        "active",
        "under_review",
        "completed",
        "archived",
      ],
      questionnaire_statuses: ["draft", "active", "under_review", "archived"],
      recommendation_status: ["not_started", "in_progress", "completed"],
      role_levels: [
        "executive",
        "management",
        "supervisor",
        "professional",
        "technician",
        "operator",
        "specialist",
        "other",
      ],
      subscription_tier_enum: ["demo", "consultant", "enterprise"],
    },
  },
} as const;

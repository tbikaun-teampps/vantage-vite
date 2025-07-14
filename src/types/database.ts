export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assessment_objectives: {
        Row: {
          assessment_id: number
          company_id: number
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          id: number
          is_deleted: boolean
          title: string
          updated_at: string
        }
        Insert: {
          assessment_id: number
          company_id: number
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          is_deleted?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          assessment_id?: number
          company_id?: number
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          is_deleted?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_objectives_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_objectives_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          asset_group_id: number
          business_unit_id: number
          company_id: number
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: number
          name: string
          questionnaire_id: number
          region_id: number
          site_id: number
          start_date: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          asset_group_id: number
          business_unit_id: number
          company_id: number
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: number
          name: string
          questionnaire_id: number
          region_id: number
          site_id: number
          start_date?: string | null
          status: string
          type?: string
          updated_at?: string
        }
        Update: {
          asset_group_id?: number
          business_unit_id?: number
          company_id?: number
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: number
          name?: string
          questionnaire_id?: number
          region_id?: number
          site_id?: number
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_asset_group_id_fkey"
            columns: ["asset_group_id"]
            isOneToOne: false
            referencedRelation: "asset_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_groups: {
        Row: {
          asset_type: string | null
          code: string | null
          company_id: number
          created_at: string
          created_by: string
          description: string | null
          id: number
          name: string
          site_id: number
          updated_at: string
        }
        Insert: {
          asset_type?: string | null
          code?: string | null
          company_id: number
          created_at?: string
          created_by: string
          description?: string | null
          id?: number
          name: string
          site_id: number
          updated_at?: string
        }
        Update: {
          asset_type?: string | null
          code?: string | null
          company_id?: number
          created_at?: string
          created_by?: string
          description?: string | null
          id?: number
          name?: string
          site_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_groups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_groups_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      business_units: {
        Row: {
          code: string | null
          company_id: number
          created_at: string
          created_by: string
          description: string | null
          id: number
          manager: string | null
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          company_id: number
          created_at?: string
          created_by: string
          description?: string | null
          id?: number
          manager?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          company_id?: number
          created_at?: string
          created_by?: string
          description?: string | null
          id?: number
          manager?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_units_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          code: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          icon_url: string | null
          id: number
          is_deleted: boolean
          is_demo: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: never
          is_deleted?: boolean
          is_demo?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: never
          is_deleted?: boolean
          is_demo?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          created_by: string
          id: number
          message: string
          page_url: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: number
          message: string
          page_url: string
          type?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: number
          message?: string
          page_url?: string
          type?: string
        }
        Relationships: []
      }
      interview_response_actions: {
        Row: {
          company_id: number
          created_at: string
          created_by: string
          description: string
          id: number
          interview_response_id: number
          title: string | null
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by: string
          description: string
          id?: number
          interview_response_id: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: string
          description?: string
          id?: number
          interview_response_id?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_response_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_response_actions_interview_response_id_fkey"
            columns: ["interview_response_id"]
            isOneToOne: false
            referencedRelation: "interview_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_response_roles: {
        Row: {
          company_id: number
          created_at: string
          created_by: string
          id: number
          interview_response_id: number
          role_id: number
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by?: string
          id?: number
          interview_response_id: number
          role_id: number
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: string
          id?: number
          interview_response_id?: number
          role_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_response_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_response_roles_interview_response_id_fkey"
            columns: ["interview_response_id"]
            isOneToOne: false
            referencedRelation: "interview_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_response_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_responses: {
        Row: {
          answered_at: string
          comments: string | null
          company_id: number
          created_at: string
          created_by: string
          id: number
          interview_id: number
          questionnaire_question_id: number
          rating_score: number
          updated_at: string
        }
        Insert: {
          answered_at?: string
          comments?: string | null
          company_id: number
          created_at?: string
          created_by: string
          id?: number
          interview_id: number
          questionnaire_question_id: number
          rating_score: number
          updated_at?: string
        }
        Update: {
          answered_at?: string
          comments?: string | null
          company_id?: number
          created_at?: string
          created_by?: string
          id?: number
          interview_id?: number
          questionnaire_question_id?: number
          rating_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_responses_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_responses_survey_question_id_fkey"
            columns: ["questionnaire_question_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_roles: {
        Row: {
          company_id: number
          created_at: string
          created_by: string
          id: number
          interview_id: number
          role_id: number
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by: string
          id?: number
          interview_id: number
          role_id: number
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: string
          id?: number
          interview_id?: number
          role_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_roles_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          assessment_id: number
          company_id: number
          created_at: string
          created_by: string
          id: number
          interviewee_count: number
          interviewer_id: string
          name: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assessment_id: number
          company_id: number
          created_at?: string
          created_by: string
          id?: number
          interviewee_count?: number
          interviewer_id: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assessment_id?: number
          company_id?: number
          created_at?: string
          created_by?: string
          id?: number
          interviewee_count?: number
          interviewer_id?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_charts: {
        Row: {
          chart_type: string | null
          code: string | null
          company_id: number
          created_at: string
          created_by: string
          description: string | null
          id: number
          name: string
          site_id: number
          updated_at: string
        }
        Insert: {
          chart_type?: string | null
          code?: string | null
          company_id: number
          created_at?: string
          created_by: string
          description?: string | null
          id?: number
          name: string
          site_id: number
          updated_at?: string
        }
        Update: {
          chart_type?: string | null
          code?: string | null
          company_id?: number
          created_at?: string
          created_by?: string
          description?: string | null
          id?: number
          name?: string
          site_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_charts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_charts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          demo_disabled_at: string | null
          demo_progress: Json | null
          email: string
          full_name: string | null
          id: string
          is_demo_mode: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          demo_disabled_at?: string | null
          demo_progress?: Json | null
          email: string
          full_name?: string | null
          id: string
          is_demo_mode?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          demo_disabled_at?: string | null
          demo_progress?: Json | null
          email?: string
          full_name?: string | null
          id?: string
          is_demo_mode?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questionnaire_question_rating_scales: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: number
          questionnaire_question_id: number
          questionnaire_rating_scale_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          id?: number
          questionnaire_question_id: number
          questionnaire_rating_scale_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: number
          questionnaire_question_id?: number
          questionnaire_rating_scale_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_question_rating_questionnaire_rating_scale_i_fkey"
            columns: ["questionnaire_rating_scale_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_rating_scales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_question_rating_sc_questionnaire_question_id_fkey"
            columns: ["questionnaire_question_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_question_roles: {
        Row: {
          created_at: string
          created_by: string
          id: number
          questionnaire_question_id: number
          shared_role_id: number
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: number
          questionnaire_question_id: number
          shared_role_id: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: number
          questionnaire_question_id?: number
          shared_role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "qustionnaire_question_roles_questionnaire_question_id_fkey"
            columns: ["questionnaire_question_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qustionnaire_question_roles_shared_role_id_fkey"
            columns: ["shared_role_id"]
            isOneToOne: false
            referencedRelation: "shared_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_questions: {
        Row: {
          context: string | null
          created_at: string
          created_by: string
          id: number
          order_index: number
          question_text: string
          questionnaire_step_id: number
          title: string
          updated_at: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          created_by: string
          id?: number
          order_index: number
          question_text: string
          questionnaire_step_id: number
          title: string
          updated_at?: string
        }
        Update: {
          context?: string | null
          created_at?: string
          created_by?: string
          id?: number
          order_index?: number
          question_text?: string
          questionnaire_step_id?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_questions_questionnaire_step_id_fkey"
            columns: ["questionnaire_step_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_rating_scales: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: number
          name: string
          order_index: number
          questionnaire_id: number
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: number
          name: string
          order_index: number
          questionnaire_id: number
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: number
          name?: string
          order_index?: number
          questionnaire_id?: number
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_rating_scales_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_sections: {
        Row: {
          created_at: string
          created_by: string
          expanded: boolean
          id: number
          order_index: number
          questionnaire_id: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expanded: boolean
          id?: number
          order_index: number
          questionnaire_id: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expanded?: boolean
          id?: number
          order_index?: number
          questionnaire_id?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_sections_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_steps: {
        Row: {
          created_at: string
          created_by: string
          expanded: boolean
          id: number
          order_index: number
          questionnaire_section_id: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expanded?: boolean
          id?: number
          order_index: number
          questionnaire_section_id: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expanded?: boolean
          id?: number
          order_index?: number
          questionnaire_section_id?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_steps_questionnaire_section_id_fkey"
            columns: ["questionnaire_section_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaires: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          guidelines: string | null
          id: number
          is_demo: boolean | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          guidelines?: string | null
          id?: number
          is_demo?: boolean | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          guidelines?: string | null
          id?: number
          is_demo?: boolean | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          business_unit_id: number
          code: string | null
          company_id: number
          created_at: string
          created_by: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          business_unit_id: number
          code?: string | null
          company_id: number
          created_at?: string
          created_by: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          business_unit_id?: number
          code?: string | null
          company_id?: number
          created_at?: string
          created_by?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regions_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string | null
          company_id: number
          created_at: string
          created_by: string
          department: string | null
          description: string | null
          id: number
          level: string | null
          org_chart_id: number
          reports_to_role_id: number | null
          requirements: string | null
          shared_role_id: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          code?: string | null
          company_id: number
          created_at?: string
          created_by: string
          department?: string | null
          description?: string | null
          id?: number
          level?: string | null
          org_chart_id: number
          reports_to_role_id?: number | null
          requirements?: string | null
          shared_role_id?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string | null
          company_id?: number
          created_at?: string
          created_by?: string
          department?: string | null
          description?: string | null
          id?: number
          level?: string | null
          org_chart_id?: number
          reports_to_role_id?: number | null
          requirements?: string | null
          shared_role_id?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_org_chart_id_fkey"
            columns: ["org_chart_id"]
            isOneToOne: false
            referencedRelation: "org_charts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_shared_role_id_fkey"
            columns: ["shared_role_id"]
            isOneToOne: false
            referencedRelation: "shared_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_roles: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          code: string | null
          company_id: number
          created_at: string
          created_by: string
          description: string | null
          id: number
          lat: number | null
          lng: number | null
          name: string
          region_id: number
          updated_at: string
        }
        Insert: {
          code?: string | null
          company_id: number
          created_at?: string
          created_by: string
          description?: string | null
          id?: number
          lat?: number | null
          lng?: number | null
          name: string
          region_id: number
          updated_at?: string
        }
        Update: {
          code?: string | null
          company_id?: number
          created_at?: string
          created_by?: string
          description?: string | null
          id?: number
          lat?: number | null
          lng?: number | null
          name?: string
          region_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

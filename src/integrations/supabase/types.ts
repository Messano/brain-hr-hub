export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          applied_at: string | null
          cover_letter: string | null
          cv_url: string | null
          email: string
          full_name: string
          id: string
          job_offer_id: string | null
          notes: string | null
          phone: string | null
          rating: number | null
          status: Database["public"]["Enums"]["candidate_status"] | null
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          cover_letter?: string | null
          cv_url?: string | null
          email: string
          full_name: string
          id?: string
          job_offer_id?: string | null
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["candidate_status"] | null
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          cover_letter?: string | null
          cv_url?: string | null
          email?: string
          full_name?: string
          id?: string
          job_offer_id?: string | null
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["candidate_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_offer_id_fkey"
            columns: ["job_offer_id"]
            isOneToOne: false
            referencedRelation: "job_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          activation_stc: boolean | null
          adresse: string | null
          adresse_facturation: string | null
          code: string
          code_commercial: string | null
          code_comptable: string | null
          code_ice: string | null
          coef_conge_paye: number | null
          coef_heures_feriees: number | null
          coef_heures_normales: number | null
          coef_heures_sup_100: number | null
          coef_heures_sup_25: number | null
          coef_heures_sup_50: number | null
          coef_indemnites_non_soumises: number | null
          coef_indemnites_soumises: number | null
          coef_prime: number | null
          contact_email: string | null
          contact_nom: string | null
          contact_telephone: string | null
          created_at: string | null
          delai_reglement: number | null
          duree_hebdomadaire: number | null
          email: string | null
          facturation_cp: boolean | null
          horaires_travail: string | null
          id: string
          is_active: boolean | null
          mode_edition_facture:
            | Database["public"]["Enums"]["invoice_mode"]
            | null
          mode_reglement: Database["public"]["Enums"]["payment_mode"] | null
          raison_sociale: string
          telephone: string | null
          titre: string | null
          tva: Database["public"]["Enums"]["tva_type"] | null
          type_client: Database["public"]["Enums"]["client_type"] | null
          updated_at: string | null
        }
        Insert: {
          activation_stc?: boolean | null
          adresse?: string | null
          adresse_facturation?: string | null
          code: string
          code_commercial?: string | null
          code_comptable?: string | null
          code_ice?: string | null
          coef_conge_paye?: number | null
          coef_heures_feriees?: number | null
          coef_heures_normales?: number | null
          coef_heures_sup_100?: number | null
          coef_heures_sup_25?: number | null
          coef_heures_sup_50?: number | null
          coef_indemnites_non_soumises?: number | null
          coef_indemnites_soumises?: number | null
          coef_prime?: number | null
          contact_email?: string | null
          contact_nom?: string | null
          contact_telephone?: string | null
          created_at?: string | null
          delai_reglement?: number | null
          duree_hebdomadaire?: number | null
          email?: string | null
          facturation_cp?: boolean | null
          horaires_travail?: string | null
          id?: string
          is_active?: boolean | null
          mode_edition_facture?:
            | Database["public"]["Enums"]["invoice_mode"]
            | null
          mode_reglement?: Database["public"]["Enums"]["payment_mode"] | null
          raison_sociale: string
          telephone?: string | null
          titre?: string | null
          tva?: Database["public"]["Enums"]["tva_type"] | null
          type_client?: Database["public"]["Enums"]["client_type"] | null
          updated_at?: string | null
        }
        Update: {
          activation_stc?: boolean | null
          adresse?: string | null
          adresse_facturation?: string | null
          code?: string
          code_commercial?: string | null
          code_comptable?: string | null
          code_ice?: string | null
          coef_conge_paye?: number | null
          coef_heures_feriees?: number | null
          coef_heures_normales?: number | null
          coef_heures_sup_100?: number | null
          coef_heures_sup_25?: number | null
          coef_heures_sup_50?: number | null
          coef_indemnites_non_soumises?: number | null
          coef_indemnites_soumises?: number | null
          coef_prime?: number | null
          contact_email?: string | null
          contact_nom?: string | null
          contact_telephone?: string | null
          created_at?: string | null
          delai_reglement?: number | null
          duree_hebdomadaire?: number | null
          email?: string | null
          facturation_cp?: boolean | null
          horaires_travail?: string | null
          id?: string
          is_active?: boolean | null
          mode_edition_facture?:
            | Database["public"]["Enums"]["invoice_mode"]
            | null
          mode_reglement?: Database["public"]["Enums"]["payment_mode"] | null
          raison_sociale?: string
          telephone?: string | null
          titre?: string | null
          tva?: Database["public"]["Enums"]["tva_type"] | null
          type_client?: Database["public"]["Enums"]["client_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contract_history: {
        Row: {
          change_type: string
          changed_at: string
          changed_by: string
          changes: Json | null
          contract_id: string
          id: string
          snapshot: Json
          version_number: number
        }
        Insert: {
          change_type: string
          changed_at?: string
          changed_by: string
          changes?: Json | null
          contract_id: string
          id?: string
          snapshot: Json
          version_number?: number
        }
        Update: {
          change_type?: string
          changed_at?: string
          changed_by?: string
          changes?: Json | null
          contract_id?: string
          id?: string
          snapshot?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_history_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          caracteristiques_poste: string | null
          client_id: string | null
          coefficient_facturation: number | null
          created_at: string | null
          date_debut: string
          date_entree_fonction: string | null
          date_fin: string | null
          id: string
          indemnites_non_soumises_montant: number | null
          indemnites_non_soumises_rubrique: string | null
          is_active: boolean | null
          justificatif: string | null
          lieu_travail: string | null
          motif_recours: string | null
          numero_commande: string | null
          numero_contrat: string
          periode_essai: Database["public"]["Enums"]["trial_period"] | null
          personnel_id: string | null
          salaire_reference: number | null
          status: Database["public"]["Enums"]["contract_status"] | null
          taux_horaire: number | null
          type_contrat: Database["public"]["Enums"]["contract_type"]
          updated_at: string | null
        }
        Insert: {
          caracteristiques_poste?: string | null
          client_id?: string | null
          coefficient_facturation?: number | null
          created_at?: string | null
          date_debut: string
          date_entree_fonction?: string | null
          date_fin?: string | null
          id?: string
          indemnites_non_soumises_montant?: number | null
          indemnites_non_soumises_rubrique?: string | null
          is_active?: boolean | null
          justificatif?: string | null
          lieu_travail?: string | null
          motif_recours?: string | null
          numero_commande?: string | null
          numero_contrat: string
          periode_essai?: Database["public"]["Enums"]["trial_period"] | null
          personnel_id?: string | null
          salaire_reference?: number | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          taux_horaire?: number | null
          type_contrat?: Database["public"]["Enums"]["contract_type"]
          updated_at?: string | null
        }
        Update: {
          caracteristiques_poste?: string | null
          client_id?: string | null
          coefficient_facturation?: number | null
          created_at?: string | null
          date_debut?: string
          date_entree_fonction?: string | null
          date_fin?: string | null
          id?: string
          indemnites_non_soumises_montant?: number | null
          indemnites_non_soumises_rubrique?: string | null
          is_active?: boolean | null
          justificatif?: string | null
          lieu_travail?: string | null
          motif_recours?: string | null
          numero_commande?: string | null
          numero_contrat?: string
          periode_essai?: Database["public"]["Enums"]["trial_period"] | null
          personnel_id?: string | null
          salaire_reference?: number | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          taux_horaire?: number | null
          type_contrat?: Database["public"]["Enums"]["contract_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendees: string[] | null
          created_at: string | null
          description: string | null
          end_datetime: string | null
          event_type: Database["public"]["Enums"]["event_type"] | null
          id: string
          location: string | null
          related_mission_id: string | null
          related_training_id: string | null
          start_datetime: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string | null
          description?: string | null
          end_datetime?: string | null
          event_type?: Database["public"]["Enums"]["event_type"] | null
          id?: string
          location?: string | null
          related_mission_id?: string | null
          related_training_id?: string | null
          start_datetime: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendees?: string[] | null
          created_at?: string | null
          description?: string | null
          end_datetime?: string | null
          event_type?: Database["public"]["Enums"]["event_type"] | null
          id?: string
          location?: string | null
          related_mission_id?: string | null
          related_training_id?: string | null
          start_datetime?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_related_mission_id_fkey"
            columns: ["related_mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_related_training_id_fkey"
            columns: ["related_training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          benefits: string[] | null
          client_id: string | null
          created_at: string | null
          department: string | null
          description: string | null
          expires_at: string | null
          id: string
          job_type: Database["public"]["Enums"]["job_type"] | null
          location: string | null
          published_at: string | null
          requirements: string[] | null
          responsibilities: string[] | null
          salary_max: number | null
          salary_min: number | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          client_id?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"] | null
          location?: string | null
          published_at?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          client_id?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"] | null
          location?: string | null
          published_at?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          candidate_id: string | null
          client_id: string | null
          contract_url: string | null
          created_at: string | null
          daily_rate: number | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          mission_type: string | null
          start_date: string
          status: Database["public"]["Enums"]["mission_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          candidate_id?: string | null
          client_id?: string | null
          contract_url?: string | null
          created_at?: string | null
          daily_rate?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          mission_type?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["mission_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string | null
          client_id?: string | null
          contract_url?: string | null
          created_at?: string | null
          daily_rate?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          mission_type?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["mission_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      payrolls: {
        Row: {
          base_salary: number
          bonus: number | null
          candidate_id: string | null
          created_at: string | null
          deductions: number | null
          id: string
          mission_id: string | null
          net_salary: number
          payment_date: string | null
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["payroll_status"] | null
          updated_at: string | null
        }
        Insert: {
          base_salary: number
          bonus?: number | null
          candidate_id?: string | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          mission_id?: string | null
          net_salary: number
          payment_date?: string | null
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["payroll_status"] | null
          updated_at?: string | null
        }
        Update: {
          base_salary?: number
          bonus?: number | null
          candidate_id?: string | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          mission_id?: string | null
          net_salary?: number
          payment_date?: string | null
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["payroll_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payrolls_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payrolls_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel: {
        Row: {
          adresse: string | null
          civilite: Database["public"]["Enums"]["civilite"]
          code_postal: string | null
          complement_adresse: string | null
          created_at: string | null
          date_entree: string | null
          date_fin_mission: string | null
          date_naissance: string | null
          date_premiere_paie: string | null
          date_validite_document: string | null
          domiciliation_bancaire: string | null
          id: string
          is_active: boolean | null
          matricule: string
          mode_paiement: Database["public"]["Enums"]["mode_paiement"] | null
          nationalite: string | null
          nom: string
          nom_jeune_fille: string | null
          numero_document: string | null
          prenom: string
          qualification: string | null
          rib: string | null
          situation_familiale:
            | Database["public"]["Enums"]["situation_familiale"]
            | null
          telephone1: string | null
          telephone2: string | null
          type_document: string | null
          updated_at: string | null
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          civilite?: Database["public"]["Enums"]["civilite"]
          code_postal?: string | null
          complement_adresse?: string | null
          created_at?: string | null
          date_entree?: string | null
          date_fin_mission?: string | null
          date_naissance?: string | null
          date_premiere_paie?: string | null
          date_validite_document?: string | null
          domiciliation_bancaire?: string | null
          id?: string
          is_active?: boolean | null
          matricule: string
          mode_paiement?: Database["public"]["Enums"]["mode_paiement"] | null
          nationalite?: string | null
          nom: string
          nom_jeune_fille?: string | null
          numero_document?: string | null
          prenom: string
          qualification?: string | null
          rib?: string | null
          situation_familiale?:
            | Database["public"]["Enums"]["situation_familiale"]
            | null
          telephone1?: string | null
          telephone2?: string | null
          type_document?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          civilite?: Database["public"]["Enums"]["civilite"]
          code_postal?: string | null
          complement_adresse?: string | null
          created_at?: string | null
          date_entree?: string | null
          date_fin_mission?: string | null
          date_naissance?: string | null
          date_premiere_paie?: string | null
          date_validite_document?: string | null
          domiciliation_bancaire?: string | null
          id?: string
          is_active?: boolean | null
          matricule?: string
          mode_paiement?: Database["public"]["Enums"]["mode_paiement"] | null
          nationalite?: string | null
          nom?: string
          nom_jeune_fille?: string | null
          numero_document?: string | null
          prenom?: string
          qualification?: string | null
          rib?: string | null
          situation_familiale?:
            | Database["public"]["Enums"]["situation_familiale"]
            | null
          telephone1?: string | null
          telephone2?: string | null
          type_document?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          file_url: string | null
          filters: Json | null
          generated_at: string | null
          id: string
          name: string
          report_type: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          filters?: Json | null
          generated_at?: string | null
          id?: string
          name: string
          report_type?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          filters?: Json | null
          generated_at?: string | null
          id?: string
          name?: string
          report_type?: string | null
          status?: string | null
        }
        Relationships: []
      }
      training_participants: {
        Row: {
          candidate_id: string | null
          completed: boolean | null
          completion_date: string | null
          created_at: string | null
          id: string
          training_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          id?: string
          training_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          id?: string
          training_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_participants_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_participants_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          end_date: string | null
          id: string
          location: string | null
          max_participants: number | null
          start_date: string
          status: Database["public"]["Enums"]["training_status"] | null
          title: string
          trainer: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["training_status"] | null
          title: string
          trainer?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["training_status"] | null
          title?: string
          trainer?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
      candidate_status:
        | "new"
        | "reviewing"
        | "interview"
        | "offer"
        | "hired"
        | "rejected"
      civilite: "Mr" | "Mle" | "Mme"
      client_type: "C1" | "C2" | "C9"
      contract_status: "brouillon" | "actif" | "termine" | "annule"
      contract_type:
        | "nouveau"
        | "modification"
        | "renouvellement"
        | "avenant"
        | "duplicata"
      event_type: "meeting" | "interview" | "training" | "deadline" | "other"
      invoice_mode: "global" | "salarie" | "commande"
      job_status: "active" | "closed" | "draft"
      job_type: "cdi" | "cdd" | "interim" | "freelance" | "stage"
      mission_status: "active" | "completed" | "pending" | "cancelled"
      mode_paiement: "espece" | "cheque" | "virement"
      payment_mode: "cheque" | "traite" | "virement"
      payroll_status: "paid" | "pending" | "processing"
      situation_familiale: "C" | "M" | "D"
      training_status: "planned" | "in_progress" | "completed" | "cancelled"
      trial_period: "2_jours" | "3_jours" | "5_jours"
      tva_type: "normale" | "exoneree" | "reduite"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "user"],
      candidate_status: [
        "new",
        "reviewing",
        "interview",
        "offer",
        "hired",
        "rejected",
      ],
      civilite: ["Mr", "Mle", "Mme"],
      client_type: ["C1", "C2", "C9"],
      contract_status: ["brouillon", "actif", "termine", "annule"],
      contract_type: [
        "nouveau",
        "modification",
        "renouvellement",
        "avenant",
        "duplicata",
      ],
      event_type: ["meeting", "interview", "training", "deadline", "other"],
      invoice_mode: ["global", "salarie", "commande"],
      job_status: ["active", "closed", "draft"],
      job_type: ["cdi", "cdd", "interim", "freelance", "stage"],
      mission_status: ["active", "completed", "pending", "cancelled"],
      mode_paiement: ["espece", "cheque", "virement"],
      payment_mode: ["cheque", "traite", "virement"],
      payroll_status: ["paid", "pending", "processing"],
      situation_familiale: ["C", "M", "D"],
      training_status: ["planned", "in_progress", "completed", "cancelled"],
      trial_period: ["2_jours", "3_jours", "5_jours"],
      tva_type: ["normale", "exoneree", "reduite"],
    },
  },
} as const

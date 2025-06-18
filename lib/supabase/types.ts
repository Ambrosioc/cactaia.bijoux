export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nom: string
          prenom: string
          telephone: string | null
          adresse: string | null
          genre: 'Homme' | 'Femme' | 'Autre' | null
          date_naissance: string | null
          newsletter: boolean
          cgv_accepted: boolean
          cgv_accepted_at: string | null
          role: 'user' | 'admin'
          active_role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          nom?: string
          prenom?: string
          telephone?: string | null
          adresse?: string | null
          genre?: 'Homme' | 'Femme' | 'Autre' | null
          date_naissance?: string | null
          newsletter?: boolean
          cgv_accepted?: boolean
          cgv_accepted_at?: string | null
          role?: 'user' | 'admin'
          active_role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          nom?: string
          prenom?: string
          telephone?: string | null
          adresse?: string | null
          genre?: 'Homme' | 'Femme' | 'Autre' | null
          date_naissance?: string | null
          newsletter?: boolean
          cgv_accepted?: boolean
          cgv_accepted_at?: string | null
          role?: 'user' | 'admin'
          active_role?: 'user' | 'admin'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      switch_active_role: {
        Args: {
          new_active_role: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type User = Database['public']['Tables']['users']['Row'];
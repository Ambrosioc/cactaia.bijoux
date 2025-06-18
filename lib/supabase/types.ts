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
      addresses: {
        Row: {
          id: string
          user_id: string
          nom_complet: string
          ligne_1: string
          ligne_2: string | null
          code_postal: string
          ville: string
          pays: string
          telephone: string
          est_principale: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nom_complet: string
          ligne_1: string
          ligne_2?: string | null
          code_postal: string
          ville: string
          pays?: string
          telephone: string
          est_principale?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nom_complet?: string
          ligne_1?: string
          ligne_2?: string | null
          code_postal?: string
          ville?: string
          pays?: string
          telephone?: string
          est_principale?: boolean
          created_at?: string
        }
      }
      produits: {
        Row: {
          id: string
          nom: string
          description: string | null
          description_courte: string | null
          prix: number
          prix_promo: number | null
          categorie: string
          variations: Json
          stock: number
          sku: string | null
          images: string[]
          est_actif: boolean
          est_mis_en_avant: boolean
          poids_grammes: number | null
          tva_applicable: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          description?: string | null
          description_courte?: string | null
          prix: number
          prix_promo?: number | null
          categorie: string
          variations?: Json
          stock?: number
          sku?: string | null
          images?: string[]
          est_actif?: boolean
          est_mis_en_avant?: boolean
          poids_grammes?: number | null
          tva_applicable?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          description?: string | null
          description_courte?: string | null
          prix?: number
          prix_promo?: number | null
          categorie?: string
          variations?: Json
          stock?: number
          sku?: string | null
          images?: string[]
          est_actif?: boolean
          est_mis_en_avant?: boolean
          poids_grammes?: number | null
          tva_applicable?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      commandes: {
        Row: {
          id: string
          user_id: string
          numero_commande: string
          produits: Json
          montant_total: number
          statut: 'en_attente' | 'payee' | 'echouee' | 'remboursee' | 'annulee'
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          adresse_livraison: Json | null
          facture_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          numero_commande?: string
          produits: Json
          montant_total: number
          statut?: 'en_attente' | 'payee' | 'echouee' | 'remboursee' | 'annulee'
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          adresse_livraison?: Json | null
          facture_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          numero_commande?: string
          produits?: Json
          montant_total?: number
          statut?: 'en_attente' | 'payee' | 'echouee' | 'remboursee' | 'annulee'
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          adresse_livraison?: Json | null
          facture_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
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
export type Address = Database['public']['Tables']['addresses']['Row'];
export type AddressInsert = Database['public']['Tables']['addresses']['Insert'];
export type AddressUpdate = Database['public']['Tables']['addresses']['Update'];

export type Product = Database['public']['Tables']['produits']['Row'];
export type ProductInsert = Database['public']['Tables']['produits']['Insert'];
export type ProductUpdate = Database['public']['Tables']['produits']['Update'];

export type Order = Database['public']['Tables']['commandes']['Row'];
export type OrderInsert = Database['public']['Tables']['commandes']['Insert'];
export type OrderUpdate = Database['public']['Tables']['commandes']['Update'];

// Types pour les produits dans les commandes
export interface OrderProduct {
  product_id: string;
  nom: string;
  prix: number;
  quantite: number;
  image?: string;
  sku?: string;
  variations?: Record<string, string>;
}

// Type pour l'adresse de livraison dans les commandes
export interface OrderAddress {
  nom_complet: string;
  ligne_1: string;
  ligne_2?: string;
  code_postal: string;
  ville: string;
  pays: string;
  telephone: string;
}
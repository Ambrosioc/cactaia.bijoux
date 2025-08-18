export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          code_postal: string
          created_at: string | null
          est_principale: boolean | null
          id: string
          ligne_1: string
          ligne_2: string | null
          nom_complet: string
          pays: string
          telephone: string
          user_id: string
          ville: string
        }
        Insert: {
          code_postal: string
          created_at?: string | null
          est_principale?: boolean | null
          id?: string
          ligne_1: string
          ligne_2?: string | null
          nom_complet: string
          pays?: string
          telephone: string
          user_id: string
          ville: string
        }
        Update: {
          code_postal?: string
          created_at?: string | null
          est_principale?: boolean | null
          id?: string
          ligne_1?: string
          ligne_2?: string | null
          nom_complet?: string
          pays?: string
          telephone?: string
          user_id?: string
          ville?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          order_id: string | null
          order_total: number | null
          page_url: string | null
          product_id: string | null
          product_name: string | null
          product_price: number | null
          search_term: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          order_total?: number | null
          page_url?: string | null
          product_id?: string | null
          product_name?: string | null
          product_price?: number | null
          search_term?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          order_total?: number | null
          page_url?: string | null
          product_id?: string | null
          product_name?: string | null
          product_price?: number | null
          search_term?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_overview"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wishlist_with_products"
            referencedColumns: ["product_slug"]
          },
        ]
      }
      commandes: {
        Row: {
          adresse_livraison: Json | null
          created_at: string | null
          facture_url: string | null
          id: string
          montant_total: number
          notes: string | null
          numero_commande: string
          produits: Json
          statut: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adresse_livraison?: Json | null
          created_at?: string | null
          facture_url?: string | null
          id?: string
          montant_total: number
          notes?: string | null
          numero_commande: string
          produits?: Json
          statut?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adresse_livraison?: Json | null
          created_at?: string | null
          facture_url?: string | null
          id?: string
          montant_total?: number
          notes?: string | null
          numero_commande?: string
          produits?: Json
          statut?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          email_type: string
          error: string | null
          id: string
          message_id: string | null
          order_id: string | null
          recipient: string
          subject: string
          success: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          email_type: string
          error?: string | null
          id?: string
          message_id?: string | null
          order_id?: string | null
          recipient: string
          subject: string
          success?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          email_type?: string
          error?: string | null
          id?: string
          message_id?: string | null
          order_id?: string | null
          recipient?: string
          subject?: string
          success?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          civilite: string
          code_reduction: string | null
          created_at: string | null
          date_desinscription: string | null
          date_inscription: string | null
          date_naissance: string
          email: string
          est_actif: boolean | null
          id: string
          nom: string
          prenom: string
          updated_at: string | null
        }
        Insert: {
          civilite: string
          code_reduction?: string | null
          created_at?: string | null
          date_desinscription?: string | null
          date_inscription?: string | null
          date_naissance: string
          email: string
          est_actif?: boolean | null
          id?: string
          nom: string
          prenom: string
          updated_at?: string | null
        }
        Update: {
          civilite?: string
          code_reduction?: string | null
          created_at?: string | null
          date_desinscription?: string | null
          date_inscription?: string | null
          date_naissance?: string
          email?: string
          est_actif?: boolean | null
          id?: string
          nom?: string
          prenom?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      produits: {
        Row: {
          categorie: string
          collections: string[] | null
          created_at: string | null
          description: string | null
          description_courte: string | null
          est_actif: boolean | null
          est_mis_en_avant: boolean | null
          id: string
          images: string[] | null
          low_stock_threshold: number | null
          nom: string
          overstock_threshold: number | null
          poids_grammes: number | null
          prix: number
          prix_promo: number | null
          sku: string | null
          slug: string
          stock: number | null
          stock_warning_enabled: boolean | null
          tva_applicable: boolean | null
          updated_at: string | null
          variations: Json | null
        }
        Insert: {
          categorie: string
          collections?: string[] | null
          created_at?: string | null
          description?: string | null
          description_courte?: string | null
          est_actif?: boolean | null
          est_mis_en_avant?: boolean | null
          id?: string
          images?: string[] | null
          low_stock_threshold?: number | null
          nom: string
          overstock_threshold?: number | null
          poids_grammes?: number | null
          prix: number
          prix_promo?: number | null
          sku?: string | null
          slug: string
          stock?: number | null
          stock_warning_enabled?: boolean | null
          tva_applicable?: boolean | null
          updated_at?: string | null
          variations?: Json | null
        }
        Update: {
          categorie?: string
          collections?: string[] | null
          created_at?: string | null
          description?: string | null
          description_courte?: string | null
          est_actif?: boolean | null
          est_mis_en_avant?: boolean | null
          id?: string
          images?: string[] | null
          low_stock_threshold?: number | null
          nom?: string
          overstock_threshold?: number | null
          poids_grammes?: number | null
          prix?: number
          prix_promo?: number | null
          sku?: string | null
          slug?: string
          stock?: number | null
          stock_warning_enabled?: boolean | null
          tva_applicable?: boolean | null
          updated_at?: string | null
          variations?: Json | null
        }
        Relationships: []
      }
      review_reports: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          review_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          review_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          review_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "review_with_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "review_with_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string
          created_at: string | null
          helpful_votes: number | null
          id: string
          is_verified_purchase: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_reason: string | null
          order_id: string | null
          product_id: string
          rating: number
          status: string
          title: string
          total_votes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          order_id?: string | null
          product_id: string
          rating: number
          status?: string
          title: string
          total_votes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          order_id?: string | null
          product_id?: string
          rating?: number
          status?: string
          title?: string
          total_votes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_overview"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wishlist_with_products"
            referencedColumns: ["product_slug"]
          },
        ]
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          current_stock: number
          id: string
          is_active: boolean | null
          product_id: string
          resolved_at: string | null
          threshold: number
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          current_stock: number
          id?: string
          is_active?: boolean | null
          product_id: string
          resolved_at?: string | null
          threshold: number
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          current_stock?: number
          id?: string
          is_active?: boolean | null
          product_id?: string
          resolved_at?: string | null
          threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_overview"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wishlist_with_products"
            referencedColumns: ["product_slug"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: string
          movement_type: string
          new_stock: number
          notes: string | null
          order_id: string | null
          previous_stock: number
          product_id: string
          quantity: number
          reason: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          movement_type: string
          new_stock: number
          notes?: string | null
          order_id?: string | null
          previous_stock: number
          product_id: string
          quantity: number
          reason: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          movement_type?: string
          new_stock?: number
          notes?: string | null
          order_id?: string | null
          previous_stock?: number
          product_id?: string
          quantity?: number
          reason?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_overview"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wishlist_with_products"
            referencedColumns: ["product_slug"]
          },
        ]
      }
      users: {
        Row: {
          active_role: string | null
          cgv_accepted: boolean | null
          cgv_accepted_at: string | null
          created_at: string | null
          date_naissance: string | null
          email: string
          genre: string | null
          id: string
          newsletter: boolean | null
          nom: string
          prenom: string
          profile_completed: boolean | null
          role: string | null
        }
        Insert: {
          active_role?: string | null
          cgv_accepted?: boolean | null
          cgv_accepted_at?: string | null
          created_at?: string | null
          date_naissance?: string | null
          email: string
          genre?: string | null
          id: string
          newsletter?: boolean | null
          nom?: string
          prenom?: string
          profile_completed?: boolean | null
          role?: string | null
        }
        Update: {
          active_role?: string | null
          cgv_accepted?: boolean | null
          cgv_accepted_at?: string | null
          created_at?: string | null
          date_naissance?: string | null
          email?: string
          genre?: string | null
          id?: string
          newsletter?: boolean | null
          nom?: string
          prenom?: string
          profile_completed?: boolean | null
          role?: string | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_overview"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wishlist_with_products"
            referencedColumns: ["product_slug"]
          },
        ]
      }
    }
    Views: {
      product_stock_overview: {
        Row: {
          active_alerts: number | null
          available_stock: number | null
          current_stock: number | null
          last_updated: string | null
          low_stock_threshold: number | null
          overstock_threshold: number | null
          product_id: string | null
          product_name: string | null
          stock_status: string | null
          stock_warning_enabled: boolean | null
        }
        Insert: {
          active_alerts?: never
          available_stock?: never
          current_stock?: number | null
          last_updated?: string | null
          low_stock_threshold?: number | null
          overstock_threshold?: number | null
          product_id?: string | null
          product_name?: string | null
          stock_status?: never
          stock_warning_enabled?: boolean | null
        }
        Update: {
          active_alerts?: never
          available_stock?: never
          current_stock?: number | null
          last_updated?: string | null
          low_stock_threshold?: number | null
          overstock_threshold?: number | null
          product_id?: string | null
          product_name?: string | null
          stock_status?: never
          stock_warning_enabled?: boolean | null
        }
        Relationships: []
      }
      review_with_user: {
        Row: {
          comment: string | null
          created_at: string | null
          helpful_votes: number | null
          id: string | null
          is_verified_purchase: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_reason: string | null
          order_id: string | null
          product_id: string | null
          product_name: string | null
          rating: number | null
          status: string | null
          title: string | null
          total_votes: number | null
          updated_at: string | null
          user_id: string | null
          user_nom: string | null
          user_prenom: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_overview"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wishlist_with_products"
            referencedColumns: ["product_slug"]
          },
        ]
      }
      wishlist_with_products: {
        Row: {
          added_at: string | null
          product_active: boolean | null
          product_category: string | null
          product_description: string | null
          product_id: string | null
          product_images: string[] | null
          product_name: string | null
          product_price: number | null
          product_promo_price: number | null
          product_slug: string | null
          product_stock: number | null
          user_id: string | null
          wishlist_item_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_overview"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wishlist_with_products"
            referencedColumns: ["product_slug"]
          },
        ]
      }
    }
    Functions: {
      add_to_wishlist: {
        Args: { product_uuid: string }
        Returns: string
      }
      can_modify_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      can_user_review: {
        Args: { user_uuid: string; product_uuid: string }
        Returns: boolean
      }
      check_stock_availability: {
        Args: { product_uuid: string; required_quantity: number }
        Returns: boolean
      }
      cleanup_old_analytics_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_review_reports: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_stock_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_stock_movements: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_discount_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_numero_commande: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_available_stock: {
        Args: { product_uuid: string }
        Returns: number
      }
      get_daily_sales: {
        Args: { days_back?: number }
        Returns: Json
      }
      get_dashboard_metrics: {
        Args: { days_back?: number }
        Returns: Json
      }
      get_product_review_stats: {
        Args: { product_uuid: string }
        Returns: Json
      }
      get_products_by_collection: {
        Args: { collection_name: string }
        Returns: {
          categorie: string
          collections: string[] | null
          created_at: string | null
          description: string | null
          description_courte: string | null
          est_actif: boolean | null
          est_mis_en_avant: boolean | null
          id: string
          images: string[] | null
          low_stock_threshold: number | null
          nom: string
          overstock_threshold: number | null
          poids_grammes: number | null
          prix: number
          prix_promo: number | null
          sku: string | null
          slug: string
          stock: number | null
          stock_warning_enabled: boolean | null
          tva_applicable: boolean | null
          updated_at: string | null
          variations: Json | null
        }[]
      }
      get_stock_status: {
        Args: { product_uuid: string }
        Returns: string
      }
      get_unique_collections: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_collections_with_counts: {
        Args: Record<PropertyKey, never>
        Returns: { collection: string; product_count: number }[]
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_product_in_wishlist: {
        Args: { product_uuid: string }
        Returns: boolean
      }
      remove_from_wishlist: {
        Args: { product_uuid: string }
        Returns: boolean
      }
      switch_active_role: {
        Args: { new_active_role: string }
        Returns: undefined
      }
      unsubscribe_newsletter: {
        Args: { email_address: string }
        Returns: boolean
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

// Types personnalisés pour les commandes
export type Order = Database['public']['Tables']['commandes']['Row'];
export type OrderInsert = Database['public']['Tables']['commandes']['Insert'];
export type OrderUpdate = Database['public']['Tables']['commandes']['Update'];

// Types personnalisés pour les adresses
export type Address = Database['public']['Tables']['addresses']['Row'];
export type AddressInsert = Database['public']['Tables']['addresses']['Insert'];
export type AddressUpdate = Database['public']['Tables']['addresses']['Update'];

// Types personnalisés pour les produits
export type Product = Database['public']['Tables']['produits']['Row'];
export type ProductInsert = Database['public']['Tables']['produits']['Insert'];
export type ProductUpdate = Database['public']['Tables']['produits']['Update'];

// Types personnalisés pour les utilisateurs
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// Types personnalisés pour les commandes
export interface OrderProduct {
  product_id: string;
  nom: string;
  prix: number;
  quantite: number;
  image?: string;
  sku?: string;
  variations?: Record<string, string>;
}

export interface OrderAddress {
  nom_complet: string;
  ligne_1: string;
  ligne_2?: string;
  code_postal: string;
  ville: string;
  pays: string;
  telephone: string;
}


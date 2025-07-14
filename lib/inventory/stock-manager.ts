import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';

export interface StockMovement {
  id?: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'reserved' | 'released';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  order_id?: string;
  user_id?: string;
  notes?: string;
  created_at?: string;
}

export interface StockAlert {
  id?: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock';
  threshold: number;
  current_stock: number;
  is_active: boolean;
  created_at?: string;
  resolved_at?: string;
}

export interface ProductStock {
  product_id: string;
  product_name: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  low_stock_threshold: number;
  last_movement: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

export class StockManager {
  private supabase;

  constructor(isServer = false) {
    this.supabase = isServer ? createServerClient() : createClient();
  }

  // Obtenir le stock d'un produit
  async getProductStock(productId: string): Promise<ProductStock | null> {
    try {
      const { data: product, error } = await this.supabase
        .from('produits')
        .select('id, nom, stock, variations')
        .eq('id', productId)
        .single();

      if (error || !product) {
        throw error;
      }

      // Calculer le stock réservé (commandes en cours)
      const { data: reservedStock } = await this.supabase
        .from('commandes')
        .select('produits')
        .eq('statut', 'en_attente')
        .not('produits', 'is', null);

      let reservedStockCount = 0;
      reservedStock?.forEach(order => {
        if (order.produits && Array.isArray(order.produits)) {
          order.produits.forEach((item: any) => {
            if (item.product_id === productId) {
              reservedStockCount += item.quantite || 0;
            }
          });
        }
      });

      const availableStock = Math.max(0, product.stock - reservedStockCount);
      const lowStockThreshold = 5; // Seuil par défaut
      const status = this.getStockStatus(availableStock, lowStockThreshold);

      return {
        product_id: product.id,
        product_name: product.nom,
        current_stock: product.stock,
        reserved_stock: reservedStockCount,
        available_stock: availableStock,
        low_stock_threshold: lowStockThreshold,
        last_movement: new Date().toISOString(),
        status
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du stock:', error);
      return null;
    }
  }

  // Ajouter du stock
  async addStock(productId: string, quantity: number, reason: string, userId?: string): Promise<boolean> {
    try {
      const { data: product, error: productError } = await this.supabase
        .from('produits')
        .select('stock')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        throw productError;
      }

      const previousStock = product.stock;
      const newStock = previousStock + quantity;

      // Mettre à jour le stock du produit
      const { error: updateError } = await this.supabase
        .from('produits')
        .update({ stock: newStock })
        .eq('id', productId);

      if (updateError) {
        throw updateError;
      }

      // Enregistrer le mouvement de stock
      await this.recordStockMovement({
        product_id: productId,
        movement_type: 'in',
        quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        reason,
        user_id: userId
      });

      // Vérifier les alertes
      await this.checkStockAlerts(productId, newStock);

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de stock:', error);
      return false;
    }
  }

  // Réserver du stock (pour une commande)
  async reserveStock(productId: string, quantity: number, orderId: string): Promise<boolean> {
    try {
      const stockInfo = await this.getProductStock(productId);
      if (!stockInfo || stockInfo.available_stock < quantity) {
        return false; // Stock insuffisant
      }

      // Enregistrer la réservation
      await this.recordStockMovement({
        product_id: productId,
        movement_type: 'reserved',
        quantity,
        previous_stock: stockInfo.current_stock,
        new_stock: stockInfo.current_stock,
        reason: 'Réservation pour commande',
        order_id: orderId
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la réservation de stock:', error);
      return false;
    }
  }

  // Libérer du stock réservé
  async releaseStock(productId: string, quantity: number, orderId: string): Promise<boolean> {
    try {
      const stockInfo = await this.getProductStock(productId);
      if (!stockInfo) {
        return false;
      }

      // Enregistrer la libération
      await this.recordStockMovement({
        product_id: productId,
        movement_type: 'released',
        quantity,
        previous_stock: stockInfo.current_stock,
        new_stock: stockInfo.current_stock,
        reason: 'Libération de réservation',
        order_id: orderId
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la libération de stock:', error);
      return false;
    }
  }

  // Consommer du stock (après paiement)
  async consumeStock(productId: string, quantity: number, orderId: string, userId?: string): Promise<boolean> {
    try {
      const { data: product, error: productError } = await this.supabase
        .from('produits')
        .select('stock')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        throw productError;
      }

      const previousStock = product.stock;
      const newStock = Math.max(0, previousStock - quantity);

      // Mettre à jour le stock du produit
      const { error: updateError } = await this.supabase
        .from('produits')
        .update({ stock: newStock })
        .eq('id', productId);

      if (updateError) {
        throw updateError;
      }

      // Enregistrer le mouvement de stock
      await this.recordStockMovement({
        product_id: productId,
        movement_type: 'out',
        quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        reason: 'Vente',
        order_id: orderId,
        user_id: userId
      });

      // Vérifier les alertes
      await this.checkStockAlerts(productId, newStock);

      return true;
    } catch (error) {
      console.error('Erreur lors de la consommation de stock:', error);
      return false;
    }
  }

  // Ajuster le stock (correction manuelle)
  async adjustStock(productId: string, newQuantity: number, reason: string, userId?: string): Promise<boolean> {
    try {
      const { data: product, error: productError } = await this.supabase
        .from('produits')
        .select('stock')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        throw productError;
      }

      const previousStock = product.stock;
      const adjustment = newQuantity - previousStock;

      // Mettre à jour le stock du produit
      const { error: updateError } = await this.supabase
        .from('produits')
        .update({ stock: newQuantity })
        .eq('id', productId);

      if (updateError) {
        throw updateError;
      }

      // Enregistrer le mouvement de stock
      await this.recordStockMovement({
        product_id: productId,
        movement_type: 'adjustment',
        quantity: adjustment,
        previous_stock: previousStock,
        new_stock: newQuantity,
        reason,
        user_id: userId
      });

      // Vérifier les alertes
      await this.checkStockAlerts(productId, newQuantity);

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajustement de stock:', error);
      return false;
    }
  }

  // Obtenir l'historique des mouvements de stock
  async getStockHistory(productId: string, limit: number = 50): Promise<StockMovement[]> {
    try {
      const { data, error } = await this.supabase
        .from('stock_movements')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  // Obtenir les alertes de stock actives
  async getActiveStockAlerts(): Promise<StockAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from('stock_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return [];
    }
  }

  // Vérifier et créer des alertes de stock
  private async checkStockAlerts(productId: string, currentStock: number): Promise<void> {
    try {
      const lowStockThreshold = 5; // Seuil par défaut
      const overstockThreshold = 100; // Seuil de surstock

      // Vérifier le stock faible
      if (currentStock <= lowStockThreshold && currentStock > 0) {
        await this.createStockAlert(productId, 'low_stock', lowStockThreshold, currentStock);
      }

      // Vérifier le stock épuisé
      if (currentStock === 0) {
        await this.createStockAlert(productId, 'out_of_stock', 0, currentStock);
      }

      // Vérifier le surstock
      if (currentStock > overstockThreshold) {
        await this.createStockAlert(productId, 'overstock', overstockThreshold, currentStock);
      }

      // Résoudre les alertes si le stock est revenu à la normale
      if (currentStock > lowStockThreshold && currentStock <= overstockThreshold) {
        await this.resolveStockAlerts(productId);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des alertes:', error);
    }
  }

  // Créer une alerte de stock
  private async createStockAlert(productId: string, alertType: string, threshold: number, currentStock: number): Promise<void> {
    try {
      // Vérifier si une alerte similaire existe déjà
      const { data: existingAlert } = await this.supabase
        .from('stock_alerts')
        .select('id')
        .eq('product_id', productId)
        .eq('alert_type', alertType)
        .eq('is_active', true)
        .single();

      if (!existingAlert) {
        await this.supabase
          .from('stock_alerts')
          .insert({
            product_id: productId,
            alert_type: alertType,
            threshold,
            current_stock: currentStock,
            is_active: true
          });
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
    }
  }

  // Résoudre les alertes de stock
  private async resolveStockAlerts(productId: string): Promise<void> {
    try {
      await this.supabase
        .from('stock_alerts')
        .update({
          is_active: false,
          resolved_at: new Date().toISOString()
        })
        .eq('product_id', productId)
        .eq('is_active', true);
    } catch (error) {
      console.error('Erreur lors de la résolution des alertes:', error);
    }
  }

  // Enregistrer un mouvement de stock
  private async recordStockMovement(movement: Omit<StockMovement, 'id' | 'created_at'>): Promise<void> {
    try {
      await this.supabase
        .from('stock_movements')
        .insert({
          ...movement,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du mouvement:', error);
    }
  }

  // Déterminer le statut du stock
  private getStockStatus(availableStock: number, lowStockThreshold: number): ProductStock['status'] {
    if (availableStock === 0) {
      return 'out_of_stock';
    } else if (availableStock <= lowStockThreshold) {
      return 'low_stock';
    } else if (availableStock > 100) {
      return 'overstock';
    } else {
      return 'in_stock';
    }
  }
}

// Instances globales
export const stockManager = new StockManager(false); // Client-side
export const serverStockManager = new StockManager(true); // Server-side 
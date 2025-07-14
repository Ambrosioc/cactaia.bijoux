import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';

// Types pour les événements analytics
export interface AnalyticsEvent {
  id?: string;
  event_type: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'search' | 'user_signup' | 'user_login';
  user_id?: string;
  session_id?: string;
  page_url?: string;
  product_id?: string;
  product_name?: string;
  product_price?: number;
  search_term?: string;
  order_id?: string;
  order_total?: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface AnalyticsMetrics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  conversion_rate: number;
  top_products: Array<{
    product_id: string;
    product_name: string;
    views: number;
    sales: number;
    revenue: number;
  }>;
  daily_sales: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  user_metrics: {
    total_users: number;
    new_users_today: number;
    active_users_today: number;
  };
}

// Classe principale pour l'analytics
export class Analytics {
  private supabase;

  constructor(isServer = false) {
    this.supabase = isServer ? createServerClient() : createClient();
  }

  // Tracker un événement
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      const supabase = await this.supabase;
      await supabase
        .from('analytics_events')
        .insert({
          ...event,
          session_id: sessionId,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erreur lors du tracking analytics:', error);
    }
  }

  // Tracker une vue de page
  async trackPageView(pageUrl: string, userId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'page_view',
      user_id: userId,
      page_url: pageUrl
    });
  }

  // Tracker une vue de produit
  async trackProductView(productId: string, productName: string, productPrice: number, userId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'product_view',
      user_id: userId,
      product_id: productId,
      product_name: productName,
      product_price: productPrice
    });
  }

  // Tracker un ajout au panier
  async trackAddToCart(productId: string, productName: string, productPrice: number, userId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'add_to_cart',
      user_id: userId,
      product_id: productId,
      product_name: productName,
      product_price: productPrice
    });
  }

  // Tracker un achat
  async trackPurchase(orderId: string, orderTotal: number, userId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'purchase',
      user_id: userId,
      order_id: orderId,
      order_total: orderTotal
    });
  }

  // Tracker une recherche
  async trackSearch(searchTerm: string, userId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'search',
      user_id: userId,
      search_term: searchTerm
    });
  }

  // Tracker une inscription
  async trackUserSignup(userId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'user_signup',
      user_id: userId
    });
  }

  // Tracker une connexion
  async trackUserLogin(userId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'user_login',
      user_id: userId
    });
  }

  // Obtenir les métriques pour le dashboard
  async getDashboardMetrics(days: number = 30): Promise<AnalyticsMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const supabase = await this.supabase;
      // Métriques des commandes
      const { data: orders } = await supabase
        .from('commandes')
        .select('id, montant_total, created_at')
        .gte('created_at', startDate.toISOString())
        .eq('statut', 'payee');

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + order.montant_total, 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Métriques des vues de produits
      const { data: productViews } = await supabase
        .from('analytics_events')
        .select('product_id, product_name, product_price')
        .eq('event_type', 'product_view')
        .gte('created_at', startDate.toISOString());

      // Calculer les produits les plus populaires
      const productStats = new Map();
      productViews?.forEach(view => {
        if (view.product_id) {
          const existing = productStats.get(view.product_id) || {
            product_id: view.product_id,
            product_name: view.product_name,
            views: 0,
            sales: 0,
            revenue: 0
          };
          existing.views++;
          productStats.set(view.product_id, existing);
        }
      });

      // Ajouter les ventes aux statistiques des produits
      orders?.forEach(order => {
        // Ici on devrait parser les produits de la commande
        // Pour simplifier, on utilise une logique basique
      });

      const topProducts = Array.from(productStats.values())
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Ventes quotidiennes
      const dailySales = this.calculateDailySales(orders || [], days);

      // Métriques utilisateurs
      const { data: users } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newUsersToday = users?.filter(user => 
        new Date(user.created_at) >= today
      ).length || 0;

      // Calculer le taux de conversion (simplifié)
      const { data: pageViews } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString());

      const conversionRate = pageViews && pageViews.length > 0 
        ? (totalOrders / pageViews.length) * 100 
        : 0;

      return {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
        conversion_rate: conversionRate,
        top_products: topProducts,
        daily_sales: dailySales,
        user_metrics: {
          total_users: users?.length || 0,
          new_users_today: newUsersToday,
          active_users_today: 0 // À implémenter avec les sessions
        }
      };
    } catch (error) {
      console.error('Erreur lors du calcul des métriques:', error);
      return {
        total_orders: 0,
        total_revenue: 0,
        average_order_value: 0,
        conversion_rate: 0,
        top_products: [],
        daily_sales: [],
        user_metrics: {
          total_users: 0,
          new_users_today: 0,
          active_users_today: 0
        }
      };
    }
  }

  // Calculer les ventes quotidiennes
  private calculateDailySales(orders: any[], days: number): Array<{ date: string; orders: number; revenue: number }> {
    const dailySales = new Map();
    
    // Initialiser tous les jours
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailySales.set(dateStr, { date: dateStr, orders: 0, revenue: 0 });
    }

    // Ajouter les commandes
    orders.forEach(order => {
      const dateStr = new Date(order.created_at).toISOString().split('T')[0];
      const existing = dailySales.get(dateStr);
      if (existing) {
        existing.orders++;
        existing.revenue += order.montant_total;
      }
    });

    return Array.from(dailySales.values()).reverse();
  }

  // Générer un ID de session unique
  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      return sessionId;
    }
    return `server_${Date.now()}`;
  }
}

// Instances globales
export const analytics = new Analytics(false); // Client-side
export const serverAnalytics = new Analytics(true); // Server-side 
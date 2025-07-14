# Guide de Test Rapide - Phase 1

## 🚀 Démarrage Rapide

### 1. Démarrer l'environnement
```bash
# Terminal 1 - Démarrer Supabase
npx supabase start

# Terminal 2 - Démarrer l'application
npm run dev
```

### 2. Test Automatisé
```bash
# Lancer les tests automatisés
npm run test
```

## 🔍 Tests Manuels Essentiels

### Test 1: Pages Principales
1. Ouvrir `http://localhost:3000`
2. Vérifier que la page d'accueil se charge
3. Naviguer vers `/boutique`
4. Naviguer vers `/contact`
5. Naviguer vers `/faq`

### Test 2: SEO
1. Ouvrir `http://localhost:3000/sitemap.xml`
   - ✅ Doit afficher un XML avec les URLs
2. Ouvrir `http://localhost:3000/robots.txt`
   - ✅ Doit afficher les règles pour les robots

### Test 3: Analytics (Admin)
1. Se connecter en tant qu'admin
2. Aller sur `/admin/analytics`
3. Vérifier l'affichage des métriques
4. Tester les filtres de date

### Test 4: Gestion des Stocks (Admin)
1. Aller sur `/admin/stock`
2. Vérifier l'affichage des mouvements
3. Tester l'ajout d'un mouvement
4. Vérifier les alertes

### Test 5: Système d'Avis
1. Aller sur une page produit
2. Vérifier l'affichage des avis
3. Tester l'ajout d'un avis (si connecté)
4. Aller sur `/admin/reviews` pour la modération

## 🐛 Problèmes Courants

### Erreur "Cannot connect to database"
- Vérifier que Supabase est démarré : `npx supabase status`
- Redémarrer : `npx supabase stop && npx supabase start`

### Erreur "Page not found"
- Vérifier que l'application est démarrée : `npm run dev`
- Vérifier les logs dans le terminal

### Erreur "Unauthorized"
- Vérifier que vous êtes connecté en tant qu'admin
- Vérifier les permissions dans Supabase

## 📊 Vérification des Données

### Dans Supabase Dashboard
1. Ouvrir `http://localhost:54323`
2. Aller dans "Table Editor"
3. Vérifier les tables :
   - `analytics_events`
   - `stock_movements`
   - `stock_alerts`
   - `reviews`
   - `review_votes`

### Vérifier les RLS (Row Level Security)
1. Dans Supabase Dashboard
2. Aller dans "Authentication" > "Policies"
3. Vérifier que les politiques sont actives

## 🎯 Tests Avancés

### Test des APIs
```bash
# Test Analytics
curl -X POST http://localhost:3000/api/analytics/events \
  -H "Content-Type: application/json" \
  -d '{"event_type":"page_view","page_url":"/test"}'

# Test Reviews
curl http://localhost:3000/api/reviews

# Test Stock (nécessite auth)
curl http://localhost:3000/api/admin/stock/movements
```

### Test des Données Structurées
1. Ouvrir une page produit
2. Clic droit > "Afficher le code source"
3. Chercher `<script type="application/ld+json">`
4. Copier le JSON et le tester sur [Google Rich Results Test](https://search.google.com/test/rich-results)

## ✅ Checklist de Validation

- [ ] Application démarre sans erreur
- [ ] Toutes les pages principales sont accessibles
- [ ] Sitemap.xml généré correctement
- [ ] Robots.txt accessible
- [ ] Analytics dashboard fonctionne (admin)
- [ ] Gestion des stocks fonctionne (admin)
- [ ] Système d'avis fonctionne
- [ ] Base de données accessible
- [ ] Toutes les tables créées
- [ ] RLS configuré correctement

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs dans le terminal
2. Vérifier les logs Supabase : `npx supabase logs`
3. Consulter le fichier `TEST_PLAN.md` pour plus de détails
4. Vérifier que toutes les migrations ont été appliquées 
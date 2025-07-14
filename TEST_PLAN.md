# Plan de Test - Phase 1 Fonctionnalités

## 1. Système d'Analytics et Reporting

### Test de l'API Analytics
- [ ] Tester l'endpoint `/api/analytics/events` (POST)
  - Envoyer un événement de vue de page
  - Envoyer un événement d'ajout au panier
  - Envoyer un événement d'achat
- [ ] Tester l'endpoint `/api/analytics/dashboard` (GET)
  - Vérifier les métriques en temps réel
  - Vérifier les graphiques
  - Vérifier les données de conversion

### Test de l'Interface Admin
- [ ] Accéder à `/admin/analytics`
- [ ] Vérifier l'affichage des métriques
- [ ] Tester les filtres de date
- [ ] Vérifier les graphiques interactifs

## 2. Gestion Avancée des Stocks

### Test de l'API Stock
- [ ] Tester `/api/admin/stock/movements` (GET)
- [ ] Tester `/api/admin/stock/movements` (POST)
- [ ] Tester `/api/admin/stock/alerts` (GET)
- [ ] Tester `/api/admin/stock/reservations` (GET)

### Test de l'Interface Admin
- [ ] Accéder à `/admin/stock`
- [ ] Vérifier l'affichage des mouvements de stock
- [ ] Tester l'ajout d'un mouvement de stock
- [ ] Vérifier les alertes de stock bas
- [ ] Tester les réservations

## 3. SEO Complet

### Test du Sitemap
- [ ] Accéder à `/sitemap.xml`
- [ ] Vérifier que tous les produits sont inclus
- [ ] Vérifier que toutes les pages sont incluses

### Test de Robots.txt
- [ ] Accéder à `/robots.txt`
- [ ] Vérifier le contenu

### Test des Données Structurées
- [ ] Inspecter le code source des pages produits
- [ ] Vérifier la présence des balises JSON-LD
- [ ] Tester avec Google Rich Results Test

## 4. Système d'Avis Clients

### Test de l'API Reviews
- [ ] Tester `/api/reviews` (GET) - Liste des avis
- [ ] Tester `/api/reviews` (POST) - Créer un avis
- [ ] Tester `/api/reviews/[id]/vote` (POST) - Voter
- [ ] Tester `/api/reviews/[id]/report` (POST) - Signaler

### Test de l'Interface
- [ ] Accéder à une page produit
- [ ] Vérifier l'affichage des avis
- [ ] Tester l'ajout d'un avis (si connecté)
- [ ] Tester le vote sur les avis
- [ ] Tester la signalisation d'avis

### Test de l'Interface Admin
- [ ] Accéder à `/admin/reviews`
- [ ] Vérifier la liste des avis
- [ ] Tester la modération (approuver/rejeter)
- [ ] Vérifier les statistiques

## 5. Tests de Base de Données

### Vérification des Tables
- [ ] Vérifier que toutes les tables sont créées
- [ ] Vérifier les contraintes et index
- [ ] Tester les RLS (Row Level Security)

### Test des Données
- [ ] Insérer des données de test
- [ ] Vérifier les relations entre tables
- [ ] Tester les requêtes complexes

## 6. Tests d'Intégration

### Test du Flux Complet
- [ ] Parcourir le site comme un utilisateur
- [ ] Ajouter des produits au panier
- [ ] Procéder au checkout
- [ ] Vérifier que les analytics sont enregistrés
- [ ] Vérifier que les stocks sont mis à jour

### Test des Permissions
- [ ] Tester l'accès admin
- [ ] Tester l'accès utilisateur
- [ ] Tester l'accès public

## Instructions de Test

1. **Démarrer l'application** : `npm run dev`
2. **Démarrer Supabase** : `npx supabase start`
3. **Ouvrir le navigateur** sur `http://localhost:3000`
4. **Suivre chaque section** du plan de test
5. **Documenter les problèmes** rencontrés
6. **Vérifier les logs** de l'application et de Supabase

## Outils de Test Recommandés

- **Postman** ou **Insomnia** pour tester les APIs
- **Google Rich Results Test** pour les données structurées
- **Lighthouse** pour les performances SEO
- **DevTools** pour inspecter les requêtes réseau
- **Supabase Dashboard** pour vérifier la base de données 
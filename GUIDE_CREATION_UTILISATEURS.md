# Guide de Création des Utilisateurs de Test

## 🎯 Objectif
Créer des utilisateurs dans Supabase Auth pour pouvoir tester toutes les fonctionnalités avec des données complètes.

## 📋 État Actuel
✅ **Créés avec succès :**
- 5 produits (bracelets, colliers, boucles d'oreilles, bagues, sets)
- 7 événements analytics (pages vues, produits vus, ajouts au panier, achats)

❌ **En attente d'utilisateurs :**
- Adresses de livraison
- Commandes
- Avis clients
- Mouvements de stock

## 🔧 Étapes pour Créer les Utilisateurs

### 1. Ouvrir le Dashboard Supabase
```bash
# Ouvrir dans le navigateur
http://localhost:54323
```

### 2. Aller dans l'onglet "Authentication"
- Cliquer sur "Users" dans le menu de gauche
- Cliquer sur "Add user" ou "New user"

### 3. Créer les Utilisateurs de Test

#### Utilisateur 1 - Admin
- **Email :** `admin@cactaia.bijoux`
- **Password :** `admin123456`
- **User ID :** Noter l'UUID généré (ex: `12345678-1234-1234-1234-123456789abc`)

#### Utilisateur 2 - Client
- **Email :** `marie.dupont@email.com`
- **Password :** `marie123456`
- **User ID :** Noter l'UUID généré

#### Utilisateur 3 - Client
- **Email :** `jean.martin@email.com`
- **Password :** `jean123456`
- **User ID :** Noter l'UUID généré

### 4. Mettre à Jour le Script de Seed

Une fois les utilisateurs créés, remplacer les UUID fictifs dans `scripts/seed-test-data.js` :

```javascript
const utilisateursFictifs = [
  { id: "VOTRE_UUID_ADMIN" },
  { id: "VOTRE_UUID_MARIE" },
  { id: "VOTRE_UUID_JEAN" }
];
```

### 5. Relancer le Seed
```bash
node scripts/seed-test-data.js
```

## 🧪 Tests à Effectuer

### Test 1 : Pages Produits
1. Aller sur `http://localhost:3000/collections`
2. Vérifier que les 5 produits s'affichent
3. Cliquer sur un produit pour voir sa page détaillée

### Test 2 : Analytics Dashboard
1. Se connecter avec `admin@cactaia.bijoux`
2. Aller sur `/admin/analytics`
3. Vérifier les métriques et graphiques

### Test 3 : Gestion des Stocks
1. Se connecter en tant qu'admin
2. Aller sur `/admin/stock`
3. Vérifier les mouvements de stock

### Test 4 : Système d'Avis
1. Aller sur une page produit
2. Vérifier l'affichage des avis
3. Se connecter et tester l'ajout d'un avis

### Test 5 : SEO
1. Vérifier `/sitemap.xml`
2. Vérifier `/robots.txt`
3. Inspecter les données structurées

## 📊 Données de Test Créées

### Produits
- **Bracelet Élégance Cactus** - 89.99€ (promo: 69.99€)
- **Collier Désert Bloom** - 129.99€
- **Boucles d'Oreilles Mini Cactus** - 45.99€ (promo: 35.99€)
- **Bague Cactus Royal** - 199.99€
- **Set Cactus Complet** - 249.99€ (promo: 199.99€)

### Événements Analytics
- Pages vues (accueil, collections)
- Vues de produits
- Ajouts au panier
- Achats

### Adresses (après création utilisateurs)
- Marie Dupont - Paris
- Jean Martin - Lyon
- Sophie Bernard - Marseille

### Commandes (après création utilisateurs)
- CMD-2024-001 - 159.98€
- CMD-2024-002 - 89.99€
- CMD-2024-003 - 199.99€

### Avis (après création utilisateurs)
- 4 avis avec notes de 3 à 5 étoiles
- Avis vérifiés (achat confirmé)

## 🚀 Prochaines Étapes

1. **Créer les utilisateurs** dans Supabase Auth
2. **Mettre à jour les UUID** dans le script
3. **Relancer le seed** pour créer adresses, commandes, avis
4. **Tester toutes les fonctionnalités**
5. **Intégrer les composants** dans l'interface

## 💡 Notes Importantes

- Les utilisateurs doivent être créés dans **Supabase Auth**, pas dans la table `users`
- La table `addresses` est séparée de `users` (relation one-to-many)
- Les commandes et avis nécessitent des utilisateurs valides
- Les mouvements de stock nécessitent des utilisateurs admin

## 🔍 Vérification

Après création des utilisateurs et relance du seed, vous devriez avoir :
- ✅ 5 produits
- ✅ 3 utilisateurs (dans Auth)
- ✅ 3 adresses
- ✅ 3 commandes
- ✅ 4 avis
- ✅ 7 événements analytics
- ✅ 5 mouvements de stock 
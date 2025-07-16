# Bonnes pratiques pour les migrations Supabase

## Convention de nommage
- Utiliser le format : `YYYYMMDDHHMMSS_description.sql`
- Un fichier = une migration logique (création de table, ajout de colonne, policies RLS, fonctions, etc.)

## Séparation des migrations complexes
- Créer la table dans un fichier
- Ajouter les policies RLS dans un autre
- Ajouter les fonctions/triggers dans un autre

## Synchronisation
- Après chaque migration, pousser immédiatement (`git push` + `supabase db push`)
- Avant de créer une nouvelle migration, faire un `supabase db pull`

## Procédure en cas de désynchronisation
1. Ne jamais supprimer de migration déjà appliquée
2. Utiliser `supabase migration repair` pour aligner l’historique
3. Utiliser `supabase db pull` pour synchroniser le schéma local

## Backup
- Faire un dump SQL avant toute opération risquée

## Exemple d’arborescence
```
supabase/migrations/
  20250715210000_create_newsletter_table.sql
  20250715210100_newsletter_rls_policies.sql
  20250715210200_newsletter_functions_triggers.sql
  ...
``` 
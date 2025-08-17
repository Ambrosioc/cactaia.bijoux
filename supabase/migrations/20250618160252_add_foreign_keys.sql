-- Migration pour ajouter les contraintes de clés étrangères
-- Cette migration s'exécute après la création de la table produits

-- Supprimer les contraintes existantes si elles existent
ALTER TABLE IF EXISTS product_categories 
    DROP CONSTRAINT IF EXISTS fk_product_categories_product;

ALTER TABLE IF EXISTS product_categories 
    DROP CONSTRAINT IF EXISTS fk_product_categories_category;

ALTER TABLE IF EXISTS product_collections 
    DROP CONSTRAINT IF EXISTS fk_product_collections_product;

ALTER TABLE IF EXISTS product_collections 
    DROP CONSTRAINT IF EXISTS fk_product_collections_collection;

-- Ajouter les contraintes de clés étrangères
ALTER TABLE product_categories 
    ADD CONSTRAINT fk_product_categories_product 
        FOREIGN KEY (product_id) REFERENCES produits(id) ON DELETE CASCADE;

ALTER TABLE product_categories 
    ADD CONSTRAINT fk_product_categories_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

ALTER TABLE product_collections 
    ADD CONSTRAINT fk_product_collections_product 
        FOREIGN KEY (product_id) REFERENCES produits(id) ON DELETE CASCADE;

ALTER TABLE product_collections 
    ADD CONSTRAINT fk_product_collections_collection 
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;

-- Commentaires sur les contraintes
COMMENT ON CONSTRAINT fk_product_categories_product ON product_categories IS 'Clé étrangère vers la table produits';
COMMENT ON CONSTRAINT fk_product_categories_category ON product_categories IS 'Clé étrangère vers la table categories';
COMMENT ON CONSTRAINT fk_product_collections_product ON product_collections IS 'Clé étrangère vers la table produits';
COMMENT ON CONSTRAINT fk_product_collections_collection ON product_collections IS 'Clé étrangère vers la table collections';

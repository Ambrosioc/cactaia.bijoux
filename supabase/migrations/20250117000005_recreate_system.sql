-- Supprimer les tables existantes si elles existent
DROP TABLE IF EXISTS product_collections CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Supprimer les fonctions et triggers existants
DROP FUNCTION IF EXISTS update_categories_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_collections_updated_at() CASCADE;

-- Créer la table categories
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table collections
CREATE TABLE collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    banner_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table de liaison produits-catégories
CREATE TABLE product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    category_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, category_id)
);

-- Créer la table de liaison produits-collections
CREATE TABLE product_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    collection_id UUID NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, collection_id)
);

-- Créer les index pour améliorer les performances
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort ON categories(sort_order);

CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_active ON collections(is_active);
CREATE INDEX idx_collections_featured ON collections(is_featured);
CREATE INDEX idx_collections_sort ON collections(sort_order);

CREATE INDEX idx_product_categories_product ON product_categories(product_id);
CREATE INDEX idx_product_categories_category ON product_categories(category_id);

CREATE INDEX idx_product_collections_product ON product_collections(product_id);
CREATE INDEX idx_product_collections_collection ON product_collections(collection_id);
CREATE INDEX idx_product_collections_sort ON product_collections(sort_order);

-- RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- Politiques temporaires sans dépendance à users
-- Ces politiques seront mises à jour plus tard quand la table users sera créée
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Categories are manageable by everyone" ON categories
    FOR ALL USING (true);

CREATE POLICY "Collections are viewable by everyone" ON collections
    FOR SELECT USING (true);

CREATE POLICY "Collections are manageable by everyone" ON collections
    FOR ALL USING (true);

CREATE POLICY "Product categories are viewable by everyone" ON product_categories
    FOR SELECT USING (true);

CREATE POLICY "Product categories are manageable by everyone" ON product_categories
    FOR ALL USING (true);

CREATE POLICY "Product collections are viewable by everyone" ON product_collections
    FOR SELECT USING (true);

CREATE POLICY "Product collections are manageable by everyone" ON product_collections
    FOR ALL USING (true);

-- Fonctions pour mettre à jour automatiquement updated_at
CREATE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER trigger_update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();

CREATE TRIGGER trigger_update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_collections_updated_at();

-- Commentaires sur les tables
COMMENT ON TABLE categories IS 'Table des catégories de produits';
COMMENT ON TABLE collections IS 'Table des collections de produits';
COMMENT ON TABLE product_categories IS 'Table de liaison produits-catégories (many-to-many)';
COMMENT ON TABLE product_collections IS 'Table de liaison produits-collections (many-to-many)';

-- Insérer les données de base pour les catégories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Bracelets', 'bracelets', 'Bracelets élégants et tendance', 1),
('Colliers', 'colliers', 'Colliers et chaînes de toutes sortes', 2),
('Bagues', 'bagues', 'Bagues et anneaux uniques', 3),
('Boucles d''oreilles', 'boucles-doreilles', 'Boucles d''oreilles créatives', 4),
('Montres', 'montres', 'Montres et garde-temps', 5),
('Accessoires', 'accessoires', 'Autres accessoires de mode', 6);

-- Insérer les données de base pour les collections
INSERT INTO collections (name, slug, description, is_featured, sort_order) VALUES
('Nouveautés', 'nouveautes', 'Découvrez nos dernières créations', true, 1),
('Classiques', 'classiques', 'Les pièces intemporelles de notre collection', false, 2),
('Élégance', 'elegance', 'Pièces raffinées pour les occasions spéciales', true, 3),
('Casual', 'casual', 'Accessoires décontractés pour le quotidien', false, 4),
('Été', 'ete', 'Collection estivale colorée et légère', true, 5),
('Hiver', 'hiver', 'Collection hivernale chaleureuse', false, 6);

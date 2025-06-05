"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, SlidersHorizontal, X } from 'lucide-react';
import { products, collections, Product, colorClasses, colorNames } from '@/lib/data/products';

export default function ShopPage() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    collections: [] as string[],
    colors: [] as string[],
    priceRange: [0, 100] as [number, number],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  
  useEffect(() => {
    let result = [...products];
    
    // Filter by category
    if (activeFilters.categories.length > 0) {
      result = result.filter(product => 
        activeFilters.categories.includes(product.category)
      );
    }
    
    // Filter by collection
    if (activeFilters.collections.length > 0) {
      result = result.filter(product => 
        product.collections.some(collection => 
          activeFilters.collections.includes(collection)
        )
      );
    }
    
    // Filter by color
    if (activeFilters.colors.length > 0) {
      result = result.filter(product => 
        product.colors.some(color => 
          activeFilters.colors.includes(color)
        )
      );
    }
    
    // Filter by price range
    result = result.filter(product => 
      product.price >= activeFilters.priceRange[0] && 
      product.price <= activeFilters.priceRange[1]
    );
    
    // Sort products
    switch (sortBy) {
      case "newest":
        // For demo purposes, sort by new flag
        result.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    
    setFilteredProducts(result);
  }, [activeFilters, sortBy]);
  
  const toggleCategoryFilter = (category: string) => {
    setActiveFilters(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      }
    });
  };
  
  const toggleCollectionFilter = (collection: string) => {
    setActiveFilters(prev => {
      if (prev.collections.includes(collection)) {
        return {
          ...prev,
          collections: prev.collections.filter(c => c !== collection)
        };
      } else {
        return {
          ...prev,
          collections: [...prev.collections, collection]
        };
      }
    });
  };
  
  const toggleColorFilter = (color: string) => {
    setActiveFilters(prev => {
      if (prev.colors.includes(color)) {
        return {
          ...prev,
          colors: prev.colors.filter(c => c !== color)
        };
      } else {
        return {
          ...prev,
          colors: [...prev.colors, color]
        };
      }
    });
  };
  
  const handlePriceChange = (min: number, max: number) => {
    setActiveFilters(prev => ({
      ...prev,
      priceRange: [min, max] as [number, number]
    }));
  };
  
  const resetFilters = () => {
    setActiveFilters({
      categories: [],
      collections: [],
      colors: [],
      priceRange: [0, 100]
    });
    setSortBy("newest");
  };
  
  const allCategories = [...new Set(products.map(product => product.category))];
  const allColors = [...new Set(products.flatMap(product => product.colors))];
  
  return (
    <div className="pt-24 pb-16">
      {/* Hero Banner */}
      <section className="relative h-[30vh] min-h-[200px] mb-8">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg"
            alt="Boutique Cactaia"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative h-full container-custom flex items-center">
          <div>
            <h1 className="heading-xl text-white mb-2">Boutique</h1>
            <p className="text-white/80 max-w-xl">
              Découvrez notre collection de bijoux écoresponsables et élégants
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom">
        {/* Mobile filters toggle */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <button
            className="btn btn-outline flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
          </button>
          
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="newest">Nouveautés</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`${
            showFilters 
              ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' 
              : 'hidden md:block'
          }`}>
            {showFilters && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Filtres</h2>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-1 rounded-full hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-lg font-medium mb-3">Catégories</h3>
                <div className="space-y-2">
                  {allCategories.map(category => (
                    <label 
                      key={category} 
                      className="flex items-center"
                    >
                      <input 
                        type="checkbox"
                        checked={activeFilters.categories.includes(category)}
                        onChange={() => toggleCategoryFilter(category)}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Collections */}
              <div>
                <h3 className="text-lg font-medium mb-3">Collections</h3>
                <div className="space-y-2">
                  {collections.map(collection => (
                    <label 
                      key={collection.id} 
                      className="flex items-center"
                    >
                      <input 
                        type="checkbox"
                        checked={activeFilters.collections.includes(collection.name)}
                        onChange={() => toggleCollectionFilter(collection.name)}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {collection.name}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Colors */}
              <div>
                <h3 className="text-lg font-medium mb-3">Couleurs</h3>
                <div className="flex flex-wrap gap-2">
                  {allColors.map(color => (
                    <button
                      key={color}
                      onClick={() => toggleColorFilter(color)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        colorClasses[color as keyof typeof colorClasses]
                      } ${
                        activeFilters.colors.includes(color)
                          ? 'ring-2 ring-primary ring-offset-2'
                          : ''
                      }`}
                      title={colorNames[color as keyof typeof colorNames]}
                      aria-label={colorNames[color as keyof typeof colorNames]}
                    />
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <h3 className="text-lg font-medium mb-3">Prix</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <button
                      onClick={() => handlePriceChange(0, 50)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        activeFilters.priceRange[0] === 0 && activeFilters.priceRange[1] === 50
                          ? 'bg-primary text-white'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      0€ - 50€
                    </button>
                    <button
                      onClick={() => handlePriceChange(50, 70)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        activeFilters.priceRange[0] === 50 && activeFilters.priceRange[1] === 70
                          ? 'bg-primary text-white'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      50€ - 70€
                    </button>
                    <button
                      onClick={() => handlePriceChange(70, 100)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        activeFilters.priceRange[0] === 70 && activeFilters.priceRange[1] === 100
                          ? 'bg-primary text-white'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      70€+
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="w-full btn btn-outline py-2"
              >
                Réinitialiser les filtres
              </button>
            </div>
            
            {/* Mobile filter close button */}
            {showFilters && (
              <div className="mt-6">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full btn btn-primary py-2"
                >
                  Voir {filteredProducts.length} produits
                </button>
              </div>
            )}
          </div>
          
          {/* Products Grid */}
          <div className="md:col-span-3">
            {/* Desktop Sort */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                {filteredProducts.length} produits
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Trier par:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="newest">Nouveautés</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                </select>
              </div>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product, i) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="group"
                  >
                    <Link href={`/produit/${product.slug}`}>
                      <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-secondary/30">
                        {product.isNew && (
                          <div className="absolute top-2 left-2 z-10 bg-primary text-white text-xs px-2 py-1 rounded">
                            Nouveau
                          </div>
                        )}
                        <button
                          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
                          aria-label="Ajouter aux favoris"
                          onClick={(e) => {
                            e.preventDefault();
                            // Add to wishlist logic would go here
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                        <Image 
                          src={product.images[0]} 
                          alt={product.name} 
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="font-medium">{product.price.toFixed(2)}€</p>
                      </div>
                    </Link>
                    <div className="mt-3 flex space-x-2">
                      {product.colors.map((color) => (
                        <div 
                          key={color}
                          className={`w-3 h-3 rounded-full ${colorClasses[color]}`}
                          title={colorNames[color]}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  Aucun produit ne correspond à vos critères de filtrage.
                </p>
                <button
                  onClick={resetFilters}
                  className="btn btn-primary px-6 py-2"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
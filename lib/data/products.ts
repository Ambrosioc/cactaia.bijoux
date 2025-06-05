export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: 'Bagues' | 'Colliers' | 'Bracelets' | 'Boucles d\'oreilles' | 'Accessoires';
  description: string;
  details: string;
  colors: ProductColor[];
  sizes?: string[];
  isNew: boolean;
  isBestseller?: boolean;
  collections: string[];
  related: string[];
}

export type ProductColor = 'gold' | 'silver' | 'rose-gold' | 'black' | 'white' | 'coral' | 'turquoise' | 'green';

export const colorNames: Record<ProductColor, string> = {
  'gold': 'Or',
  'silver': 'Argent',
  'rose-gold': 'Or rosé',
  'black': 'Noir',
  'white': 'Blanc',
  'coral': 'Corail',
  'turquoise': 'Turquoise',
  'green': 'Vert',
};

export const colorClasses: Record<ProductColor, string> = {
  'gold': 'bg-yellow-400',
  'silver': 'bg-gray-300',
  'rose-gold': 'bg-pink-300',
  'black': 'bg-black',
  'white': 'bg-white border border-gray-300',
  'coral': 'bg-red-400',
  'turquoise': 'bg-teal-400',
  'green': 'bg-green-500',
};

export const products: Product[] = [
  {
    id: '1',
    name: 'Bracelet Cactus',
    slug: 'bracelet-cactus',
    price: 59.00,
    images: [
      'https://images.pexels.com/photos/9428804/pexels-photo-9428804.jpeg',
      'https://images.pexels.com/photos/9428799/pexels-photo-9428799.jpeg',
      'https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg'
    ],
    category: 'Bracelets',
    description: 'Inspiré de la beauté minimaliste du désert, ce bracelet en acier inoxydable allie élégance et robustesse.',
    details: 'Bracelet en acier inoxydable 316L hypoallergénique, disponible en finition or, argent et or rosé. Diamètre ajustable pour s\'adapter à tous les poignets.',
    colors: ['gold', 'silver', 'rose-gold'],
    isNew: true,
    isBestseller: true,
    collections: ['Désert', 'Mixte'],
    related: ['2', '4', '6']
  },
  {
    id: '2',
    name: 'Collier Désert',
    slug: 'collier-desert',
    price: 65.00,
    images: [
      'https://images.pexels.com/photos/10964788/pexels-photo-10964788.jpeg',
      'https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg',
      'https://images.pexels.com/photos/7794535/pexels-photo-7794535.jpeg'
    ],
    category: 'Colliers',
    description: 'Un collier raffiné évoquant les étendues désertiques et la beauté des paysages arides.',
    details: 'Collier en acier inoxydable 316L hypoallergénique avec pendentif en forme de soleil stylisé. Chaîne de 45cm avec extension de 5cm. Disponible en finition or et argent.',
    colors: ['gold', 'silver'],
    isNew: false,
    collections: ['Désert', 'Femme'],
    related: ['1', '3', '5']
  },
  {
    id: '3',
    name: 'Boucles Soleil',
    slug: 'boucles-soleil',
    price: 45.00,
    images: [
      'https://images.pexels.com/photos/6767789/pexels-photo-6767789.jpeg',
      'https://images.pexels.com/photos/8100785/pexels-photo-8100785.jpeg',
      'https://images.pexels.com/photos/7794535/pexels-photo-7794535.jpeg'
    ],
    category: 'Boucles d\'oreilles',
    description: 'Des boucles d\'oreilles qui captent la lumière comme le soleil se reflète sur le sable du désert.',
    details: 'Boucles d\'oreilles en acier inoxydable 316L hypoallergénique avec fermoirs sécurisés. Disponibles en finition or, argent et or rosé.',
    colors: ['gold', 'silver', 'rose-gold'],
    isNew: false,
    isBestseller: true,
    collections: ['Désert', 'Femme'],
    related: ['2', '5', '7']
  },
  {
    id: '4',
    name: 'Bracelet Dune',
    slug: 'bracelet-dune',
    price: 55.00,
    images: [
      'https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg',
      'https://images.pexels.com/photos/9428804/pexels-photo-9428804.jpeg',
      'https://images.pexels.com/photos/7794535/pexels-photo-7794535.jpeg'
    ],
    category: 'Bracelets',
    description: 'Un bracelet aux lignes ondulées comme les dunes de sable façonnées par le vent.',
    details: 'Bracelet en acier inoxydable 316L hypoallergénique. Son design ondulé s\'inspire des dunes de sable. Disponible en finition or et argent.',
    colors: ['gold', 'silver'],
    isNew: true,
    collections: ['Désert', 'Mixte'],
    related: ['1', '6', '8']
  },
  {
    id: '5',
    name: 'Collier Épine',
    slug: 'collier-epine',
    price: 70.00,
    images: [
      'https://images.pexels.com/photos/7794535/pexels-photo-7794535.jpeg',
      'https://images.pexels.com/photos/10964788/pexels-photo-10964788.jpeg',
      'https://images.pexels.com/photos/9428799/pexels-photo-9428799.jpeg'
    ],
    category: 'Colliers',
    description: 'Un collier audacieux inspiré des épines protectrices du cactus, symbole de force et de résilience.',
    details: 'Collier en acier inoxydable 316L hypoallergénique avec pendentif épine de cactus stylisé. Chaîne de 50cm. Disponible en finition or, argent, or rosé et noir.',
    colors: ['gold', 'silver', 'rose-gold', 'black'],
    isNew: false,
    isBestseller: true,
    collections: ['Cactus', 'Mixte'],
    related: ['2', '3', '8']
  },
  {
    id: '6',
    name: 'Bague Oasis',
    slug: 'bague-oasis',
    price: 50.00,
    images: [
      'https://images.pexels.com/photos/12612486/pexels-photo-12612486.jpeg',
      'https://images.pexels.com/photos/12612490/pexels-photo-12612490.jpeg',
      'https://images.pexels.com/photos/12612501/pexels-photo-12612501.jpeg'
    ],
    category: 'Bagues',
    description: 'Une bague délicate évoquant le calme et la sérénité d\'une oasis au milieu du désert.',
    details: 'Bague en acier inoxydable 316L hypoallergénique. Son design épuré et sa finesse en font un bijou parfait pour le quotidien. Disponible en finition or, argent et or rosé.',
    colors: ['gold', 'silver', 'rose-gold'],
    sizes: ['49', '51', '53', '55', '57', '59'],
    isNew: false,
    collections: ['Désert', 'Mixte'],
    related: ['1', '4', '7']
  },
  {
    id: '7',
    name: 'Boucles Cactus',
    slug: 'boucles-cactus',
    price: 48.00,
    images: [
      'https://images.pexels.com/photos/6767788/pexels-photo-6767788.jpeg',
      'https://images.pexels.com/photos/6767789/pexels-photo-6767789.jpeg',
      'https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg'
    ],
    category: 'Boucles d\'oreilles',
    description: 'Des boucles d\'oreilles en forme de cactus stylisés, symbole de force et de beauté même dans les conditions les plus difficiles.',
    details: 'Boucles d\'oreilles en acier inoxydable 316L hypoallergénique représentant un cactus stylisé. Fermoirs sécurisés pour un confort quotidien. Disponibles en finition or et argent.',
    colors: ['gold', 'silver'],
    isNew: true,
    collections: ['Cactus', 'Femme'],
    related: ['3', '5', '8']
  },
  {
    id: '8',
    name: 'Collier Saguaro',
    slug: 'collier-saguaro',
    price: 68.00,
    images: [
      'https://images.pexels.com/photos/10964788/pexels-photo-10964788.jpeg',
      'https://images.pexels.com/photos/7794535/pexels-photo-7794535.jpeg',
      'https://images.pexels.com/photos/9428799/pexels-photo-9428799.jpeg'
    ],
    category: 'Colliers',
    description: 'Un collier inspiré du majestueux cactus Saguaro, emblème des déserts américains, alliant élégance et caractère.',
    details: 'Collier en acier inoxydable 316L hypoallergénique avec pendentif Saguaro finement ciselé. Chaîne de 45cm avec extension de 5cm. Disponible en finition or, argent et or rosé.',
    colors: ['gold', 'silver', 'rose-gold'],
    isNew: false,
    collections: ['Cactus', 'Mixte'],
    related: ['2', '5', '7']
  }
];

export const collections = [
  { id: 'desert', name: 'Désert', description: 'Une collection inspirée par les paysages arides et minimalistes des déserts' },
  { id: 'cactus', name: 'Cactus', description: 'Des bijoux évoquant la force et la résilience du cactus, symbole de notre marque' },
  { id: 'femme', name: 'Femme', description: 'Des créations délicates et élégantes pour sublimer la féminité' },
  { id: 'homme', name: 'Homme', description: 'Des pièces épurées aux lignes fortes pour un style affirmé' },
  { id: 'mixte', name: 'Mixte', description: 'Des bijoux intemporels qui transcendent les genres' }
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(product => product.slug === slug);
};

export const getProductsByCategory = (category: string) => {
  return products.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
};

export const getProductsByCollection = (collection: string) => {
  return products.filter(product => 
    product.collections.some(col => 
      col.toLowerCase() === collection.toLowerCase()
    )
  );
};

export const getRelatedProducts = (productId: string) => {
  const product = products.find(p => p.id === productId);
  if (!product) return [];
  
  return product.related.map(id => 
    products.find(p => p.id === id)
  ).filter(Boolean) as Product[];
};

export const getNewProducts = () => {
  return products.filter(product => product.isNew);
};

export const getBestsellerProducts = () => {
  return products.filter(product => product.isBestseller);
};
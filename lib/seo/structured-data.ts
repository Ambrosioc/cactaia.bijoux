export interface ProductStructuredData {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand: string;
  category: string;
  sku?: string;
  slug?: string;
  mpn?: string;
  gtin?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export interface OrganizationStructuredData {
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint: {
    telephone: string;
    contactType: string;
    email?: string;
  };
  sameAs: string[];
}

export interface BreadcrumbStructuredData {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export interface WebSiteStructuredData {
  name: string;
  url: string;
  description: string;
  potentialAction: {
    target: string;
    queryInput: string;
  };
}

// Générer les structured data pour un produit
export function generateProductStructuredData(product: ProductStructuredData): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/produit/${product.slug || product.sku}`,
    },
    ...(product.sku && { sku: product.sku }),
    ...(product.mpn && { mpn: product.mpn }),
    ...(product.gtin && { gtin: product.gtin }),
    ...(product.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.aggregateRating.ratingValue,
        reviewCount: product.aggregateRating.reviewCount,
      },
    }),
  };

  return JSON.stringify(structuredData);
}

// Générer les structured data pour l'organisation
export function generateOrganizationStructuredData(org: OrganizationStructuredData): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    description: org.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: org.address.streetAddress,
      addressLocality: org.address.addressLocality,
      postalCode: org.address.postalCode,
      addressCountry: org.address.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: org.contactPoint.telephone,
      contactType: org.contactPoint.contactType,
      ...(org.contactPoint.email && { email: org.contactPoint.email }),
    },
    sameAs: org.sameAs,
  };

  return JSON.stringify(structuredData);
}

// Générer les structured data pour les breadcrumbs
export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbStructuredData): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(structuredData);
}

// Générer les structured data pour le site web
export function generateWebSiteStructuredData(website: WebSiteStructuredData): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: website.name,
    url: website.url,
    description: website.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: website.potentialAction.target,
      'query-input': website.potentialAction.queryInput,
    },
  };

  return JSON.stringify(structuredData);
}

// Générer les structured data pour une page FAQ
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return JSON.stringify(structuredData);
}

// Générer les structured data pour une page de collection
export function generateCollectionStructuredData(collection: {
  name: string;
  description: string;
  image: string;
  url: string;
  products: Array<{ name: string; url: string; image: string; price: number }>;
}): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    image: collection.image,
    url: collection.url,
    hasPart: collection.products.map((product) => ({
      '@type': 'Product',
      name: product.name,
      url: product.url,
      image: product.image,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      },
    })),
  };

  return JSON.stringify(structuredData);
}

// Générer les structured data pour une page de contact
export function generateContactStructuredData(contact: {
  name: string;
  url: string;
  telephone: string;
  email: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
}): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: contact.name,
    url: contact.url,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contact.telephone,
      contactType: 'customer service',
      email: contact.email,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address.streetAddress,
      addressLocality: contact.address.addressLocality,
      postalCode: contact.address.postalCode,
      addressCountry: contact.address.addressCountry,
    },
  };

  return JSON.stringify(structuredData);
}

// Générer les structured data pour une page d'avis clients
export function generateReviewStructuredData(reviews: Array<{
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
  itemReviewed: string;
}>): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: reviews[0]?.itemReviewed || 'Produit',
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
      reviewCount: reviews.length,
      bestRating: 5,
    },
  };

  return JSON.stringify(structuredData);
} 
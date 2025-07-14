import { CollectionShowcase, FeaturedProducts, HeroCarousel, TestimonialsSection, ValuesSection } from '@/components/client/dynamic-imports';
import OptimizedImage from '@/components/ui/optimized-image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Carousel */}
      <HeroCarousel />

      {/* Collections Highlight */}
      <CollectionShowcase />

      {/* Our Values */}
      <ValuesSection />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* About Brand Banner */}
      <section className="py-20 bg-secondary">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg mb-6">Notre histoire</h2>
              <p className="text-muted-foreground mb-4">
                Cactaia est née d&apos;une passion pour les bijoux durables et porteurs de sens. Notre marque s&apos;inspire de la force et de la beauté des cactus - des plantes résistantes mais délicates.
              </p>
              <p className="text-muted-foreground mb-6">
                Chaque pièce est conçue pour vous accompagner dans le temps, comme une seconde peau, alliant élégance et simplicité.
              </p>
              <Link
                href="/a-propos"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="relative h-96">
              <OptimizedImage
                src="/images/cactaïa-18.jpg"
                alt="Notre atelier"
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Instagram Banner */}
      <section className="py-16">
        <div className="container-custom text-center">
          <h2 className="heading-md mb-8">Suivez-nous sur Instagram</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square relative rounded-md overflow-hidden group">
                <OptimizedImage
                  src={`https://images.pexels.com/photos/${5370968 + i}/pexels-photo-${5370968 + i}.jpeg`}
                  alt={`Instagram post ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline px-6 py-2"
            >
              @cactaia.bijoux
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary/5">
        <div className="container-custom text-center max-w-2xl">
          <h2 className="heading-md mb-4">Restez informés</h2>
          <p className="text-muted-foreground mb-8">
            Inscrivez-vous à notre newsletter pour découvrir nos nouveautés et recevoir des offres exclusives.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Votre email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
              required
            />
            <button
              type="submit"
              className="btn btn-primary h-10 px-4 py-2 sm:w-auto"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
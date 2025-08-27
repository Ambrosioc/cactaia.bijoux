import { CollectionShowcase, FeaturedProducts, HeroCarousel, InstagramFeed, NewsletterModal, TestimonialsSection, ValuesSection } from '@/components/client/dynamic-imports';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/ui/optimized-image';
import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Carousel */}
      <HeroCarousel />

      <section className="py-20">
        <div className="container-custom">
          <h2 className="heading-lg text-center">
            Des beautés de la nature pour révéler la vôtre✨.
          </h2>
        </div>
      </section>

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

      {/* Instagram Feed avec images de tailles différentes */}
      <InstagramFeed />

      {/* Newsletter avec bouton modal */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary">
        <div className="container-custom text-center">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                <Mail className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="heading-md mb-4">Restez informés</h2>
              <p className="text-muted-foreground">
                Inscrivez-vous à notre newsletter et obtenez une réduction sur votre première commande !
              </p>
            </div>

            <NewsletterModal>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3"
              >
                <Mail className="mr-2 h-5 w-5" />
                S&apos;inscrire à la newsletter
              </Button>
            </NewsletterModal>
          </div>
        </div>
      </section>
    </div>
  );
}
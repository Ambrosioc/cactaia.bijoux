import { Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="font-playfair text-2xl font-medium">
              Cactaia<span className="text-primary">.</span>Bijoux
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Des bijoux écoresponsables, mixtes et élégants avec des valeurs de durabilité, simplicité et force symbolique.
            </p>
            <div className="flex space-x-4">
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-medium mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/boutique" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="font-medium mb-4">Informations</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/cgv" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/politique-de-retour" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Politique de retour
                </Link>
              </li>
              <li>
                <Link href="/politique-de-livraison" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Politique de livraison
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <address className="not-italic">
              <p className="text-muted-foreground text-sm mb-2">42 rue Maurice Violette</p>
              <p className="text-muted-foreground text-sm mb-2">Luisant 28600</p>
              <p className="text-muted-foreground text-sm mb-4">France</p>
              <p className="text-muted-foreground text-sm mb-2">
                <a href="mailto:contact@cactaiabijoux.fr" className="hover:text-primary transition-colors">
                  contact@cactaiabijoux.fr
                </a>
              </p>
              <p className="text-muted-foreground text-sm">
                Support: 9h à 18h30
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-xs">
            © {currentYear} Cactaia.Bijoux. Tous droits réservés.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-muted-foreground text-xs">
              Des bijoux avec des valeurs de durabilité, simplicité et force symbolique.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
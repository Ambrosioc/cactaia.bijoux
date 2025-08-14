import { Instagram } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="w-48 h-16 relative">
              <Image
                src="/CACTAIA LOGO_CACTAIA LOGO TERRA-07.png"
                alt="Cactaia Bijoux Logo"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Des bijoux écoresponsables, mixtes et élégants avec des valeurs de durabilité, simplicité et force symbolique.
            </p>
            <div className="flex space-x-4">
              <Link href="https://instagram.com/cactaia.bijoux" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://www.tiktok.com/@cactaiabijoux" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 4 15.38a6.33 6.33 0 0 0 10.86 4.43l.02-.02a6.188 6.188 0 0 0 1.74-4.31V6.69a8.2 8.2 0 0 0 2.97.56z" />
                </svg>
                <span className="sr-only">TikTok</span>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-medium mb-4">Navigation</h4>
            <ul className="space-y-2">
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
                <Link href="/retours" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Politique de retour
                </Link>
              </li>
              <li>
                <Link href="/livraison" className="text-muted-foreground text-sm hover:text-primary transition-colors">
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
            © {currentYear} <span className="align-middle inline-block w-6 h-6 relative"><Image src="/CACTAIA LOGO_CACTAIA LOGO TERRA-07.png" alt="Cactaia Bijoux Logo" fill className="object-contain" /></span> Tous droits réservés.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-muted-foreground text-xs">
              Des bijoux avec des valeurs de durabilité, simplicité et force symbolique.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Site créé par <a href="https://acdinnovservices.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">acdinnovservices.com</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
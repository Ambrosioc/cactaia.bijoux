import Link from 'next/link';

export const metadata = {
  title: 'Mentions Légales - Cactaia.Bijoux',
  description: 'Mentions légales et informations juridiques de Cactaia.Bijoux.',
};

export default function LegalNoticePage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-custom">
        <h1 className="heading-lg mb-8">Mentions Légales</h1>

        <div className="prose max-w-none">
          <section className="mb-12">
            <h2 className="heading-md mb-4">1. Informations légales</h2>
            <p className="text-muted-foreground mb-4">
              Le site Cactaia.Bijoux est édité par :
            </p>
            <ul className="list-none space-y-2 text-muted-foreground">
              <li>SARL Cactaia</li>
              <li>42 rue Maurice Violette</li>
              <li>28600 Luisant</li>
              <li>France</li>
              <li>Capital social : 10 000€</li>
              <li>SIRET : 123 456 789 00012</li>
              <li>TVA Intracommunautaire : FR 12 345678900</li>
              <li>Email : contact@cactaiabijoux.fr</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="heading-md mb-4">2. Hébergement</h2>
            <p className="text-muted-foreground mb-4">
              Le site est hébergé par :
            </p>
            <ul className="list-none space-y-2 text-muted-foreground">
              <li>Société XYZ Hosting</li>
              <li>123 rue de l&apos;Hébergement</li>
              <li>75001 Paris</li>
              <li>France</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="heading-md mb-4">3. Propriété intellectuelle</h2>
            <p className="text-muted-foreground mb-6">
              L&apos;ensemble du contenu de ce site (textes, images, vidéos, etc.) est protégé par le droit d&apos;auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>
            <p className="text-muted-foreground">
              Les marques et logos présents sur ce site sont des marques déposées par Cactaia.Bijoux ou ses partenaires. Toute reproduction sans autorisation préalable est interdite.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="heading-md mb-4">4. Protection des données personnelles</h2>
            <p className="text-muted-foreground mb-4">
              Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition aux données personnelles vous concernant.
            </p>
            <p className="text-muted-foreground mb-4">
              Pour exercer ces droits ou pour toute question sur le traitement de vos données, vous pouvez nous contacter à l&apos;adresse suivante : contact@cactaiabijoux.fr
            </p>
            <p className="text-muted-foreground">
              Pour plus d&apos;informations sur la gestion de vos données personnelles, consultez notre{' '}
              <Link href="/politique-de-confidentialite" className="text-primary hover:underline">
                politique de confidentialité
              </Link>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="heading-md mb-4">5. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Ce site utilise des cookies pour améliorer votre expérience de navigation. En continuant à naviguer sur ce site, vous acceptez l&apos;utilisation de cookies conformément à notre{' '}
              <Link href="/politique-des-cookies" className="text-primary hover:underline">
                politique des cookies
              </Link>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="heading-md mb-4">6. Limitation de responsabilité</h2>
            <p className="text-muted-foreground mb-4">
              Cactaia.Bijoux s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Cactaia.Bijoux ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition sur ce site.
            </p>
            <p className="text-muted-foreground">
              En conséquence, Cactaia.Bijoux décline toute responsabilité pour tout dommage résultant notamment d&apos;une imprécision ou inexactitude des informations disponibles sur ce site.
            </p>
          </section>

          <section>
            <h2 className="heading-md mb-4">7. Droit applicable</h2>
            <p className="text-muted-foreground mb-4">
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
            </p>
            <p className="text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
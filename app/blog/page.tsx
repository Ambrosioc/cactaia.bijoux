'use client';

import HeroSection from '@/components/ui/hero-section';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Sample blog data
const blogPosts = [
  {
    id: 1,
    title: 'Les bijoux intemporels : un investissement pour la vie',
    slug: 'bijoux-intemporels-investissement-pour-la-vie',
    excerpt: 'Découvrez pourquoi les bijoux de qualité sont bien plus qu\'un simple accessoire, mais un véritable investissement émotionnel et durable.',
    image: 'https://images.pexels.com/photos/5370795/pexels-photo-5370795.jpeg',
    date: '2025-05-15',
    category: 'Conseils',
  },
  {
    id: 2,
    title: 'L\'acier inoxydable : pourquoi c\'est le choix idéal pour vos bijoux',
    slug: 'acier-inoxydable-choix-ideal-bijoux',
    excerpt: 'L\'acier inoxydable est devenu un matériau de prédilection dans la joaillerie contemporaine. Découvrez ses nombreux avantages.',
    image: 'https://images.pexels.com/photos/12612486/pexels-photo-12612486.jpeg',
    date: '2025-04-28',
    category: 'Matériaux',
  },
  {
    id: 3,
    title: 'Comment porter vos bijoux avec style en toute saison',
    slug: 'comment-porter-bijoux-avec-style',
    excerpt: 'Astuces et conseils pour intégrer harmonieusement vos bijoux à votre tenue, quelle que soit la saison ou l\'occasion.',
    image: 'https://images.pexels.com/photos/6767789/pexels-photo-6767789.jpeg',
    date: '2025-04-10',
    category: 'Style',
  },
  {
    id: 4,
    title: 'Dans les coulisses : le processus de création d\'un bijou Cactaia',
    slug: 'coulisses-processus-creation-bijou-cactaia',
    excerpt: 'De l\'esquisse à la pièce finale, découvrez le parcours artisanal qui donne vie à chacune de nos créations.',
    image: 'https://images.pexels.com/photos/6767893/pexels-photo-6767893.jpeg',
    date: '2025-03-25',
    category: 'Coulisses',
  },
  {
    id: 5,
    title: 'Le pouvoir symbolique des bijoux à travers les cultures',
    slug: 'pouvoir-symbolique-bijoux-cultures',
    excerpt: 'Depuis la nuit des temps, les bijoux sont porteurs de sens. Explorez la symbolique des bijoux dans différentes cultures et traditions.',
    image: 'https://images.pexels.com/photos/7794535/pexels-photo-7794535.jpeg',
    date: '2025-03-12',
    category: 'Inspiration',
  },
  {
    id: 6,
    title: 'Comment entretenir vos bijoux pour qu\'ils durent toute une vie',
    slug: 'entretien-bijoux-durabilite',
    excerpt: 'Conseils pratiques et astuces pour préserver l\'éclat et la beauté de vos bijoux au fil des années.',
    image: 'https://images.pexels.com/photos/9428804/pexels-photo-9428804.jpeg',
    date: '2025-02-28',
    category: 'Conseils',
  },
];

const categories = [...new Set(blogPosts.map(post => post.category))];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.5,
    },
  }),
};

export default function BlogPage() {
  return (
    <div className="pb-16">
      {/* Hero Banner */}
      <HeroSection image="https://images.pexels.com/photos/7276787/pexels-photo-7276787.jpeg" alt="Blog Cactaia" priority>
        <h1 className="heading-xl text-white mb-4">Le Journal Cactaia</h1>
        <p className="text-white/90 text-lg">
          Découvrez nos articles sur l&apos;univers des bijoux, nos inspirations et nos conseils.
        </p>
      </HeroSection>

      <div className="container-custom py-16">
        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-full bg-primary text-white text-sm"
          >
            Tous les articles
          </Link>
          {categories.map(category => (
            <Link
              key={category}
              href={`/blog/categorie/${category.toLowerCase()}`}
              className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-sm transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-video md:aspect-square overflow-hidden rounded-lg">
              <Image
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-sm text-primary font-medium mb-2 inline-block">
                {blogPosts[0].category}
              </span>
              <h2 className="heading-lg mb-3">{blogPosts[0].title}</h2>
              <p className="text-muted-foreground mb-2">
                {formatDate(blogPosts[0].date)}
              </p>
              <p className="mb-6">{blogPosts[0].excerpt}</p>
              <Link
                href={`/blog/${blogPosts[0].slug}`}
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                Lire l&apos;article <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post, i) => (
            <motion.article
              key={post.id}
              custom={i}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Link href={`/blog/${post.slug}`} className="group">
                <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="text-sm text-primary font-medium mb-2 inline-block">
                  {post.category}
                </span>
                <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {formatDate(post.date)}
                </p>
                <p className="text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                <span className="inline-flex items-center text-primary group-hover:text-primary/80 transition-colors">
                  Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
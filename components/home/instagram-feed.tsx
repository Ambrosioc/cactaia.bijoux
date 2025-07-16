'use client';

import OptimizedImage from '@/components/ui/optimized-image';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Données des images Instagram pour le slider
const instagramImages = [
    {
        id: 1,
        src: "/images/cactaïa-01.jpg",
        alt: "Cactaia Bijoux - Collection Nature",
    },
    {
        id: 2,
        src: "/images/cactaïa-02.jpg",
        alt: "Cactaia Bijoux - Style Élégant",
    },
    {
        id: 3,
        src: "/images/cactaïa-03.jpg",
        alt: "Cactaia Bijoux - Atelier",
    },
    {
        id: 4,
        src: "/images/cactaïa-04.jpg",
        alt: "Cactaia Bijoux - Créations Uniques",
    },
    {
        id: 5,
        src: "/images/cactaïa-05.jpg",
        alt: "Cactaia Bijoux - Inspiration Désert",
    },
    {
        id: 6,
        src: "/images/cactaïa-06.jpg",
        alt: "Cactaia Bijoux - Élégance Naturelle",
    },
    {
        id: 7,
        src: "/images/cactaïa-07.jpg",
        alt: "Cactaia Bijoux - Collection Été",
    },
    {
        id: 8,
        src: "/images/cactaïa-08.jpg",
        alt: "Cactaia Bijoux - Style Minimaliste",
    },
    {
        id: 9,
        src: "/images/cactaïa-09.jpg",
        alt: "Cactaia Bijoux - Bijoux Durables",
    },
    {
        id: 10,
        src: "/images/cactaïa-10.jpg",
        alt: "Cactaia Bijoux - Inspiration Cactus",
    },
    {
        id: 11,
        src: "/images/cactaïa-11.jpg",
        alt: "Cactaia Bijoux - Collection Hiver",
    },
    {
        id: 12,
        src: "/images/cactaïa-12.jpg",
        alt: "Cactaia Bijoux - Élégance Moderne",
    }
];

const InstagramFeed = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const element = document.getElementById('instagram-feed');
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, []);

    return (
        <section id="instagram-feed" className="py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
            <div className="container-custom">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Instagram className="h-8 w-8 text-pink-500" />
                        <h2 className="heading-lg text-gray-800">Suivez-nous sur Instagram</h2>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Découvrez nos créations en temps réel et partagez vos moments avec nos bijoux
                    </p>
                </motion.div>

                {/* Slider horizontal avec images sur une ligne */}
                <div
                    className="relative w-full overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <motion.div
                        className="flex gap-6"
                        animate={isVisible && !isHovered ? { x: [0, -1000] } : { x: 0 }}
                        transition={{
                            x: {
                                duration: 30,
                                repeat: Infinity,
                                ease: "linear",
                                repeatType: "loop"
                            }
                        }}
                    >
                        {/* Premier set d'images */}
                        {instagramImages.map((image) => (
                            <motion.div
                                key={image.id}
                                className="relative flex-shrink-0 w-80 h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] overflow-hidden rounded-xl group cursor-pointer"
                                whileHover={{
                                    scale: 1.05,
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <OptimizedImage
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 640px) 320px, (max-width: 768px) 384px, 500px"
                                />

                                {/* Overlay avec effet de hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="flex items-center gap-3 text-white">
                                            <Instagram className="h-6 w-6" />
                                            <span className="text-lg font-medium">@cactaia.bijoux</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Effet de brillance au hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
                            </motion.div>
                        ))}

                        {/* Deuxième set d'images pour un défilement infini */}
                        {instagramImages.map((image) => (
                            <motion.div
                                key={`duplicate-${image.id}`}
                                className="relative flex-shrink-0 w-80 h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] overflow-hidden rounded-xl group cursor-pointer"
                                whileHover={{
                                    scale: 1.05,
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <OptimizedImage
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 640px) 320px, (max-width: 768px) 384px, 500px"
                                />

                                {/* Overlay avec effet de hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="flex items-center gap-3 text-white">
                                            <Instagram className="h-6 w-6" />
                                            <span className="text-lg font-medium">@cactaia.bijoux</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Effet de brillance au hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Bouton CTA */}
                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <Link
                        href="https://instagram.com/cactaia.bijoux"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105"
                    >
                        <Instagram className="h-5 w-5" />
                        Suivez-nous sur Instagram
                        <span className="text-sm opacity-90">@cactaia.bijoux</span>
                    </Link>
                </motion.div>

                {/* Statistiques Instagram */}
                <motion.div
                    className="flex justify-center items-center gap-8 mt-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={isVisible ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 1 }}
                >
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-800">2.5K</span>
                        <span className="text-sm text-muted-foreground">Abonnés</span>
                    </div>
                    <div className="w-px h-8 bg-gray-300" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-800">150+</span>
                        <span className="text-sm text-muted-foreground">Publications</span>
                    </div>
                    <div className="w-px h-8 bg-gray-300" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-800">98%</span>
                        <span className="text-sm text-muted-foreground">Satisfaction</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default InstagramFeed; 
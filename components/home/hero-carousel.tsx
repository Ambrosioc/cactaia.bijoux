'use client';

import OptimizedImage from '@/components/ui/optimized-image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const heroImages = [
    {
        src: "/images/cactaïa-19.jpg",
        alt: "Cactaia Bijoux - Collection Nature",
        title: "Des bijoux inspirés par la nature",
        subtitle: "Découvrez nos collections de bijoux écoresponsables, élégants et intemporels qui célèbrent la beauté de la nature."
    },
    {
        src: "/images/cactaïa-23.jpg",
        alt: "Cactaia Bijoux - Notre Atelier",
        title: "Créés avec passion",
        subtitle: "Chaque pièce est conçue pour vous accompagner dans le temps, comme une seconde peau, alliant élégance et simplicité."
    }
];

export default function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Carousel Images */}
            {heroImages.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <OptimizedImage
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>
            ))}

            {/* Content */}
            <div className="relative container mx-auto h-full flex flex-col justify-center items-start px-4 sm:px-6 lg:px-8 z-10">
                <div className="max-w-lg animate-fadeIn">
                    <h1 className="heading-xl text-white mb-6">
                        {heroImages[currentIndex].title}
                    </h1>
                    <p className="text-white/90 mb-8 text-lg">
                        {heroImages[currentIndex].subtitle}
                    </p>
                    <a
                        href="/collections"
                        className="btn btn-primary px-8 py-3"
                    >
                        Découvrir nos collections
                    </a>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
                aria-label="Image précédente"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>

            <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
                aria-label="Image suivante"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {heroImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'bg-white scale-125'
                            : 'bg-white/50 hover:bg-white/75'
                            }`}
                        aria-label={`Aller à l'image ${index + 1}`}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
                <div
                    className="h-full bg-white transition-all duration-5000 ease-linear"
                    style={{
                        width: `${((currentIndex + 1) / heroImages.length) * 100}%`
                    }}
                />
            </div>
        </section>
    );
} 
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ReactNode } from 'react';

interface HeroSectionProps {
    image: string;
    alt?: string;
    children?: ReactNode;
    overlayClassName?: string;
    className?: string;
    priority?: boolean;
    zoomEffect?: boolean;
}

export default function HeroSection({
    image,
    alt = '',
    children,
    overlayClassName = 'bg-black/40',
    className = '',
    priority = false,
    zoomEffect = true,
}: HeroSectionProps) {

    return (
        <section className={cn('relative h-screen w-full overflow-hidden', className)}>
            <div className="relative w-full h-full">
                <Image
                    src={image}
                    alt={alt}
                    fill
                    className={cn(
                        'object-cover transition-transform duration-[3000ms] ease-out',
                        zoomEffect && 'scale-110 hover:scale-105'
                    )}
                    priority={priority}
                />
            </div>
            {/* Overlay */}
            <div className={cn('absolute inset-0 z-10', overlayClassName)} />
            {/* Centred content */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                {children}
            </div>
        </section>
    );
} 
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
}

export default function HeroSection({
    image,
    alt = '',
    children,
    overlayClassName = 'bg-black/40',
    className = '',
    priority = false,
}: HeroSectionProps) {
    return (
        <section className={cn('relative h-screen w-full', className)}>
            <Image
                src={image}
                alt={alt}
                fill
                className="object-cover"
                priority={priority}
            />
            {/* Overlay */}
            <div className={cn('absolute inset-0 z-10', overlayClassName)} />
            {/* Centred content */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                {children}
            </div>
        </section>
    );
} 
import { useEffect, useState } from 'react';

interface UseImagePreloadOptions {
  images: string[];
  priority?: boolean;
}

export function useImagePreload({ images, priority = false }: UseImagePreloadOptions) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!images.length) {
      setIsLoading(false);
      return;
    }

    const preloadImages = async () => {
      const imagePromises = images.map((src) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, src]));
            resolve();
          };
          
          img.onerror = () => {
            console.warn(`Failed to preload image: ${src}`);
            resolve(); // Continue even if one image fails
          };
          
          img.src = src;
        });
      });

      try {
        await Promise.all(imagePromises);
      } catch (error) {
        console.error('Error preloading images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (priority) {
      // Preload immediately for priority images
      preloadImages();
    } else {
      // Delay preloading for non-priority images
      const timeoutId = setTimeout(preloadImages, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [images, priority]);

  return {
    loadedImages,
    isLoading,
    isImageLoaded: (src: string) => loadedImages.has(src),
  };
} 
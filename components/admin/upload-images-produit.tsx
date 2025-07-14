'use client';

import OptimizedImage from '@/components/ui/optimized-image';
import { createClient } from '@/lib/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface UploadImagesProduitProps {
    productId?: string;
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

export default function UploadImagesProduit({
    productId,
    images,
    onImagesChange,
    maxImages = 10,
    disabled = false
}: UploadImagesProduitProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const supabase = createClient();

    const uploadImage = async (file: File): Promise<string> => {
        if (!productId) {
            throw new Error('Product ID is required for image upload');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `produits/${productId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('produits')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('produits')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleFileUpload = async (files: FileList) => {
        if (!files.length || disabled) return;

        const remainingSlots = maxImages - images.length;
        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        if (filesToUpload.length === 0) {
            alert(`Vous ne pouvez ajouter que ${maxImages} images maximum.`);
            return;
        }

        setUploading(true);

        try {
            const uploadPromises = filesToUpload.map(uploadImage);
            const newImageUrls = await Promise.all(uploadPromises);

            const updatedImages = [...images, ...newImageUrls];
            onImagesChange(updatedImages);
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            alert('Erreur lors de l\'upload des images. Veuillez réessayer.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = async (imageUrl: string, index: number) => {
        if (disabled) return;

        try {
            // Extraire le chemin du fichier depuis l'URL
            const urlParts = imageUrl.split('/');
            const bucketIndex = urlParts.findIndex(part => part === 'produits');
            if (bucketIndex !== -1) {
                const filePath = urlParts.slice(bucketIndex).join('/');

                // Supprimer le fichier du storage
                await supabase.storage
                    .from('produits')
                    .remove([filePath]);
            }

            // Mettre à jour la liste des images
            const updatedImages = images.filter((_, i) => i !== index);
            onImagesChange(updatedImages);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression de l\'image.');
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragActive(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    }, [handleFileUpload]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">
                    Images du produit ({images.length}/{maxImages})
                </label>
                {!productId && (
                    <p className="text-xs text-amber-600">
                        Sauvegardez d'abord le produit pour ajouter des images
                    </p>
                )}
            </div>

            {/* Zone d'upload */}
            {productId && images.length < maxImages && (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                        ? 'border-primary bg-primary/5'
                        : disabled
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                        }`}
                    onDragEnter={handleDragIn}
                    onDragLeave={handleDragOut}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={disabled || uploading}
                    />

                    <div className="space-y-2">
                        {uploading ? (
                            <>
                                <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
                                <p className="text-sm text-muted-foreground">Upload en cours...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Glissez vos images ici ou cliquez pour parcourir
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    PNG, JPG, WEBP jusqu'à 10MB
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Grille des images */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {images.map((imageUrl, index) => (
                            <motion.div
                                key={imageUrl}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                            >
                                <OptimizedImage
                                    src={imageUrl}
                                    alt={`Image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                />

                                {/* Badge image principale */}
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                                        Principale
                                    </div>
                                )}

                                {/* Bouton de suppression */}
                                {!disabled && (
                                    <button
                                        onClick={() => removeImage(imageUrl, index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Supprimer cette image"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}

                                {/* Overlay au hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Message si aucune image */}
            {images.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune image ajoutée</p>
                </div>
            )}

            {/* Informations */}
            <div className="text-xs text-muted-foreground space-y-1">
                <p>• La première image sera utilisée comme image principale</p>
                <p>• Formats acceptés : PNG, JPG, WEBP</p>
                <p>• Taille maximale : 10MB par image</p>
                <p>• Glissez-déposez pour réorganiser l'ordre</p>
            </div>
        </div>
    );
}
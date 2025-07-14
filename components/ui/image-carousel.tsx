"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'

interface ImageCarouselProps {
    images: string[]
    productName: string
}

export function ImageCarousel({ images, productName }: ImageCarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const previousImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const goToImage = (index: number) => {
        setCurrentImageIndex(index)
    }

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Aucune image disponible</span>
            </div>
        )
    }

    return (
        <>
            {/* Carrousel principal */}
            <div className="space-y-4">
                {/* Image principale */}
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                    <img
                        src={images[currentImageIndex]}
                        alt={`${productName} - Vue ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                        onClick={openModal}
                    />

                    {/* Boutons de navigation */}
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    previousImage()
                                }}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    nextImage()
                                }}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {/* Indicateurs */}
                    {images.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        goToImage(index)
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Miniatures */}
                {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${index === currentImageIndex
                                    ? 'ring-2 ring-primary'
                                    : 'hover:ring-2 hover:ring-primary/50'
                                    }`}
                                onClick={() => goToImage(index)}
                            >
                                <img
                                    src={image}
                                    alt={`${productName} - Miniature ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal pour l'image en grand */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-0">
                    <DialogTitle className="sr-only">
                        {productName} - Vue détaillée
                    </DialogTitle>
                    <div className="relative w-full h-full">
                        {/* Bouton fermer */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white border-white/20"
                            onClick={closeModal}
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        {/* Image en grand */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={images[currentImageIndex]}
                                alt={`${productName} - Vue ${currentImageIndex + 1}`}
                                className="max-w-full max-h-full object-contain"
                            />

                            {/* Boutons de navigation */}
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/20"
                                        onClick={previousImage}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/20"
                                        onClick={nextImage}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Indicateurs en bas */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`w-3 h-3 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                            }`}
                                        onClick={() => goToImage(index)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Compteur d'images */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 right-4 text-white/80 text-sm">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
} 
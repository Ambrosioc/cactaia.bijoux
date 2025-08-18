'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    className = ''
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Générer les numéros de page à afficher
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 7;

        if (totalPages <= maxVisiblePages) {
            // Afficher toutes les pages si il y en a peu
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logique pour afficher un nombre limité de pages
            if (currentPage <= 4) {
                // Début de la liste
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Fin de la liste
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Milieu de la liste
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`flex items-center justify-between ${className}`}>
            {/* Informations sur les éléments affichés */}
            <div className="text-sm text-muted-foreground">
                Affichage de {startItem} à {endItem} sur {totalItems} résultats
            </div>

            {/* Navigation des pages */}
            <div className="flex items-center space-x-2">
                {/* Bouton précédent */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Numéros de page */}
                <div className="flex items-center space-x-1">
                    {pageNumbers.map((page, index) => {
                        if (page === '...') {
                            return (
                                <div key={`ellipsis-${index}`} className="px-2 py-1">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </div>
                            );
                        }

                        const pageNumber = page as number;
                        const isActive = pageNumber === currentPage;

                        return (
                            <Button
                                key={pageNumber}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(pageNumber)}
                                className={`h-8 w-8 p-0 ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
                            >
                                {pageNumber}
                            </Button>
                        );
                    })}
                </div>

                {/* Bouton suivant */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Sélecteur d'éléments par page */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Éléments par page:</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        const newItemsPerPage = parseInt(e.target.value);
                        // Recalculer la page actuelle
                        const newTotalPages = Math.ceil(totalItems / newItemsPerPage);
                        const newCurrentPage = Math.min(currentPage, newTotalPages);
                        onPageChange(newCurrentPage);
                    }}
                    className="border border-input rounded px-2 py-1 text-sm"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </div>
    );
}

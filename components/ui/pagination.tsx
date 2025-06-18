'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  className
}: PaginationProps) {
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
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

  if (totalPages <= 1) return null;

  return (
    <nav className={cn("flex justify-center", className)}>
      <div className="flex items-center space-x-2">
        {/* Bouton Précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || loading}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Précédent
        </button>

        {/* Numéros de pages */}
        <div className="flex space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...' || loading}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                page === currentPage
                  ? 'bg-primary text-white'
                  : page === '...'
                    ? 'text-gray-400 cursor-default'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              )}
            >
              {page === '...' ? <MoreHorizontal className="h-4 w-4" /> : page}
            </button>
          ))}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Suivant
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </nav>
  );
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}) {
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn("text-center text-sm text-muted-foreground", className)}>
      Affichage de {startItem} à {endItem} sur {totalItems} produits
      {totalPages > 1 && (
        <span className="ml-2">(page {currentPage} sur {totalPages})</span>
      )}
    </div>
  );
}
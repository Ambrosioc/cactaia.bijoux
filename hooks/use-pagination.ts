'use client';

import { useEffect, useState } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetToFirstPage: () => void;
  getOffset: () => number;
  getLimit: () => number;
}

export function usePagination({
  totalItems,
  itemsPerPage,
  initialPage = 1
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Reset to first page when totalItems changes significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  const getOffset = () => {
    return (currentPage - 1) * itemsPerPage;
  };

  const getLimit = () => {
    return itemsPerPage;
  };

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setCurrentPage,
    nextPage,
    prevPage,
    resetToFirstPage,
    getOffset,
    getLimit
  };
}
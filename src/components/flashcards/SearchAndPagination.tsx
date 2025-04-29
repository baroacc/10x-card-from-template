import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchAndPaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onSearch: (term: string) => void;
  onPageChange: (page: number) => void;
}

export function SearchAndPagination({
  total,
  currentPage,
  pageSize,
  onSearch,
  onPageChange,
}: SearchAndPaginationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const totalPages = Math.ceil(total / pageSize);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
            data-testid={`pagination-page-${i}`}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (startPage > 1) {
      pages.unshift(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis data-testid="pagination-start-ellipsis" />
        </PaginationItem>
      );
      pages.unshift(
        <PaginationItem key={1}>
          <PaginationLink 
            onClick={() => onPageChange(1)}
            data-testid="pagination-page-1"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis data-testid="pagination-end-ellipsis" />
        </PaginationItem>
      );
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            onClick={() => onPageChange(totalPages)}
            data-testid={`pagination-page-${totalPages}`}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <div className="space-y-4" data-testid="search-pagination-container">
      <Input
        type="search"
        placeholder="Search flashcards..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
        data-testid="search-input"
      />
      {total > 0 && (
        <Pagination data-testid="pagination">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                data-testid="pagination-previous"
              />
            </PaginationItem>
            {renderPageNumbers()}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                data-testid="pagination-next"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
} 
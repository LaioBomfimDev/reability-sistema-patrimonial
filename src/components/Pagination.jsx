import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGINATION_LIMIT } from '../utils/constants';

const Pagination = ({ currentPage, totalCount, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / PAGINATION_LIMIT);
  const startItem = currentPage * PAGINATION_LIMIT + 1;
  const endItem = Math.min((currentPage + 1) * PAGINATION_LIMIT, totalCount);

  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(0, currentPage - 2);
      const end = Math.min(totalPages - 1, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis and first/last pages if needed
      if (start > 0) {
        if (start > 1) {
          pages.unshift('...');
        }
        pages.unshift(0);
      }
      
      if (end < totalPages - 1) {
        if (end < totalPages - 2) {
          pages.push('...');
        }
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Mobile: Simple Previous/Next */}
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentPage === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentPage >= totalPages - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Próximo
          </button>
        </div>

        {/* Desktop: Full pagination */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startItem}</span> a{' '}
              <span className="font-medium">{endItem}</span> de{' '}
              <span className="font-medium">{totalCount}</span> resultados
            </p>
          </div>

          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {/* Previous Button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                  currentPage === 0
                    ? 'text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Page Numbers */}
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={index}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                  currentPage >= totalPages - 1
                    ? 'text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
import React from 'react';
import styles from '../../styles/Categories.module.css';

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    handlePageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, handlePageChange }) => {
    const pages: (number | string)[] = [];

    // Determine the range of pages to display
    if (totalPages <= 4) {
        // If total pages are 4 or less, display all
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // If total pages are more than 4
        if (currentPage <= 2) {
            // Display first 3 pages and last page
            pages.push(1, 2, 3);
            if (totalPages > 3) pages.push('...', totalPages);
        } else if (currentPage === totalPages) {
            // If on the last page, show last 3 pages and first page
            pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
        } else {
            // For middle pages, show previous 1, current, next 1, and last page
            pages.push(currentPage - 1, currentPage, currentPage + 1);
            if (currentPage + 1 < totalPages) pages.push('...', totalPages);
        }
    }

    return (
        <div className={styles.pagination}>
            {/* Previous button */}
            {totalPages > 1 && (
                <a
      
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon-icon-Dp3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </a>
            )}

            {/* Page buttons */}
            {pages.map((page, index) => (
                <React.Fragment key={index}>
                    {page === '...' ? (
                        <span>...</span>
                    ) : (
                        <a
                            // style={{ border: currentPage === page ? "solid 1px #000000" : "" }}
                            onClick={() => handlePageChange(page as number)}
                        >
                            {page}
                        </a>
                    )}
                </React.Fragment>
            ))}

            {/* Next button */}
            {totalPages > 1 && (
                <a
                    style={{ backgroundColor: currentPage === totalPages ? "#e7e7e7" : "" }}
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon-icon-Dp3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </a>
            )}
        </div>
    );
};

export default Pagination;

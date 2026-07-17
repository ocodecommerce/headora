import React from "react";
import styles from "../../styles/Categories.module.css";
import Image from "next/image";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  handlePageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
  }

  return (
    <div className={styles.pagination}>
      {/* First */}
      <button
        className={styles.paginationBtn}
        disabled={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
            <Image
                    src="/Images/NextUp/rewind.png"
                    alt="back"
                    width={20}
                    height={20}
                  />
      </button>

      {/* Previous */}
      <button
        className={styles.paginationBtn}
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
                        <Image
                    src="/Images/NextUp/backward-arrow.png"
                    alt="back"
                    width={14}
                    height={14}
                  />
      </button>

      {/* Pages */}
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={index} className={styles.paginationDots}>
            ...
          </span>
        ) : (
          <button
            key={index}
            className={`${styles.pageNumber} ${
              currentPage === page ? styles.activePage : ""
            }`}
            onClick={() => handlePageChange(page as number)}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        className={styles.paginationBtn}
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
                  <Image
                    src="/Images/NextUp/next.png"
                    alt="back"
                    width={14}
                    height={14}
                  />
      </button>

      {/* Last */}
      <button
        className={styles.paginationBtn}
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(totalPages)}
      >
                   <Image
                    src="/Images/NextUp/fast-forward.png"
                    alt="back"
                    width={20}
                    height={20}
                  />
      </button>
    </div>
  );
};

export default Pagination;
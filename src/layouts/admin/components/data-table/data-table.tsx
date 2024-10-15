import React, { ReactNode, useEffect, useMemo, useState } from "react";

interface DataTableProps {
  data: any[];
  columns: {
    key: string;
    label: string | JSX.Element | Element | ReactNode;
    isSorting?: boolean;
    hidden?: boolean;
  }[];
  enableSorting?: boolean;
  enableSearching?: boolean;
  enablePagination?: boolean;
  enableGoToPagination?: boolean;
  paginationData?: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
  };
  className?: string;
  onPageChange?: (newPage: number) => void;
  maxVisiblePages?: number;
  isLoading?: boolean;
  tableClassName?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  enableSorting = false,
  enableSearching = false,
  enablePagination = false,
  enableGoToPagination = false,
  paginationData,
  onPageChange,
  className = "",
  isLoading = false,
  tableClassName = "",
  // maxVisiblePages = 3, // Default to 5 visible pages.
}) => {
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputPage, setInputPage] = useState<number | "">(1);

  // const { totalItems, currentPage } = paginationData || {};
  const { totalItems = 0, currentPage = 1 } = paginationData || {};

  const sortedData = useMemo(() => {
    if (!enableSorting || !sortedColumn) return data;

    const sorted = [...data];
    sorted.sort((a, b) => {
      if (columns.find((col) => col.key === sortedColumn)?.isSorting) {
        // Sorting for boolean columns
        const aValue = a[sortedColumn];
        const bValue = b[sortedColumn];
        if (sortDirection === "asc") {
          return aValue === bValue ? 0 : aValue ? -1 : 1;
        } else {
          return aValue === bValue ? 0 : aValue ? 1 : -1;
        }
      } else {
        // Sorting for non-boolean columns (e.g., strings)
        const aValue = a[sortedColumn];
        const bValue = b[sortedColumn];
        if (aValue === null || aValue === undefined) return -1;
        if (bValue === null || bValue === undefined) return 1;
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
    });
    return sorted;
  }, [data, enableSorting, sortedColumn, sortDirection, columns]);

  const filteredData = useMemo(() => {
    if (!enableSearching || !searchQuery) return sortedData;

    const query = searchQuery.toLowerCase();
    return sortedData.filter((row) =>
      columns.some((column) => String(row[column.key]).toLowerCase().includes(query)),
    );
  }, [enableSearching, searchQuery, sortedData, columns]);

  const totalPages = useMemo(() => {
    if (!enablePagination) return 1;
    return Math.ceil(totalItems / (paginationData?.itemsPerPage || 10));
  }, [enablePagination, totalItems, paginationData]);

  const paginatedData = useMemo(() => {
    if (!enablePagination) return filteredData;

    // const startIndex = (currentPage - 1) * (paginationData?.itemsPerPage || 10);
    return filteredData; // .slice(startIndex, startIndex + (paginationData?.itemsPerPage || 10));
  }, [enablePagination, currentPage, filteredData, paginationData]);

  const handleSort = (columnKey: string) => {
    if (!enableSorting) return;

    // Find the column configuration for the clicked column
    const clickedColumn = columns.find((col) => col.key === columnKey);

    // Check if sorting should be disabled for the clicked column
    if (clickedColumn?.isSorting === false) return;

    // Toggle the sort direction if the same column is clicked
    if (columnKey === sortedColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortedColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    if (onPageChange) {
      onPageChange(1);
    }
  };

  // const renderPageNumbers = () => {
  //   if (totalPages <= maxVisiblePages) {
  //     return Array.from({ length: totalPages }, (_, index) => renderPageLink(index + 1));
  //   }

  //   const halfVisiblePages = Math.floor(maxVisiblePages / 2);
  //   const startPage = Math.max(currentPage - halfVisiblePages, 1);
  //   const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  //   const pages: ReactNode[] = [];
  //   if (startPage > 1) {
  //     pages.push(renderPageLink(1));
  //     if (startPage > 2) {
  //       pages.push(<span key="startEllipsis">...</span>);
  //     }
  //   }

  //   for (let page = startPage; page <= endPage; page++) {
  //     pages.push(renderPageLink(page));
  //   }

  //   if (endPage < totalPages) {
  //     if (endPage < totalPages - 1) {
  //       pages.push(<span key="endEllipsis">...</span>);
  //     }
  //     pages.push(renderPageLink(totalPages));
  //   }

  //   return pages;
  // };

  // const renderPageLink = (page: number) => (
  //   <a
  //     key={page}
  //     className={`paginate_button ${currentPage === page ? "current" : ""}`}
  //     aria-controls="myTable"
  //     role="link"
  //     aria-current={currentPage === page ? "page" : undefined}
  //     data-dt-idx={page - 1}
  //     onClick={() => onPageChange && onPageChange(page)}
  //   >
  //     {page}
  //   </a>
  // );

  const handleLoadMore = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange && onPageChange(newPage);
    }
  };

  const handlePageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    const pageNumber = value ? parseInt(value, 10) : "";

    if (typeof pageNumber === "number" && pageNumber >= 1 && pageNumber <= totalPages) {
      setInputPage(pageNumber);
    } else {
      setInputPage("");
    }
  };

  const handlePageInputBlur = () => {
    if (inputPage === "") {
      setInputPage(currentPage);
    } else if (typeof inputPage === "number" && inputPage >= 1 && inputPage <= totalPages) {
      onPageChange && onPageChange(inputPage);
    } else {
      setInputPage(currentPage);
    }
  };

  const handlePageInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const pageNumber = parseInt(inputPage as string, 10);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        onPageChange && onPageChange(pageNumber);
      }
    }
  };

  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  return (
    <div className={`wrapper ${className}`}>
      {enableSearching && (
        <div
          className="search-container"
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            width: "100%",
            height: "48px",
          }}
        >
          <div
            className="table-search-data"
            style={{
              display: "flex",
              position: "absolute",
              top: "0",
              right: "0",
            }}
          >
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </div>
        </div>
      )}
      <div>
        <table
          cellSpacing="0"
          className={tableClassName ? `${tableClassName}` : "files-table datatable"}
          id="myTable"
        >
          <thead>
            <tr className="file-row">
              {columns.map(
                (column) =>
                  !column.hidden && (
                    <th
                      key={column.key}
                      className={`file-row-${column.key} ${
                        sortedColumn === column.key ? "sorted" : ""
                      }`}
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.label as ReactNode}</span>
                      {enableSorting && sortedColumn === column.key && (
                        <span className="sort-icon">{sortDirection === "asc" ? "▲" : "▼"}</span>
                      )}
                    </th>
                  ),
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData?.map((row, index) => (
              <tr
                className={`file-row ${row?.processStatus === 2 ? "added-new-file-row" : ""}`}
                key={index}
              >
                {columns.map(
                  (column) =>
                    !column.hidden && (
                      <td key={column.key} className={`file-row-${column.key}`}>
                        {row[column.key]}
                      </td>
                    ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {enablePagination && (
        <div>
          <div id="myTable_info" role="status" aria-live="polite">
            {/* {paginationData && totalItems === 0
              ? "No entries"
              : paginationData
              ? `Showing ${Math.min(
                  (currentPage - 1) * paginationData.itemsPerPage + 1,
                  totalItems,
                )} to 
          ${Math.min(
            currentPage * paginationData.itemsPerPage,
            totalItems,
          )} of ${totalItems} entries`
              : ""} */}
          </div>

          <div className="dataTables_paginate paging_simple_numbers" id="myTable_paginate">
            {/* <a
              className={`paginate_button previous ${currentPage === 1 ? "disabled" : ""}`}
              aria-controls="myTable"
              aria-disabled={currentPage === 1 ? "true" : "false"}
              role="link"
              data-dt-idx="previous"
              id="myTable_previous"
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
            >
              Previous
            </a> */}
            {/* {Array.from({ length: totalPages }).map((_, index) => (
              <a
                key={index}
                className={`paginate_button ${currentPage === index + 1 ? "current" : ""}`}
                aria-controls="myTable"
                role="link"
                aria-current={currentPage === index + 1 ? "page" : undefined}
                data-dt-idx={index}
                onClick={() => onPageChange && onPageChange(index + 1)}
              >
                {index + 1}
              </a>
            ))} */}
            {/* {renderPageNumbers()} */}
            {/* <a
              className={`paginate_button next ${currentPage === totalPages ? "disabled" : ""}`}
              aria-controls="myTable"
              aria-disabled={currentPage === totalPages ? "true" : "false"}
              role="link"
              data-dt-idx="next"
              id="myTable_next"
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
            >
              Next
            </a> */}
            {/* {isLoading ? (
              <div className="flex justify-end">
                <div className="simpleO-loader"></div>
              </div>
            ) : currentPage === totalPages ? null : totalPages > 0 ? (
              <div className="mt-3 mb-2 flex justify-end">
                {paginationData && paginationData?.totalItems > 10 && (
                  <button
                    className={`load-more-btn paginate_button next ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                    onClick={() => handleLoadMore(currentPage + 1)}
                  >
                    Load More
                  </button>
                )}
              </div>
            ) : null} */}
            {isLoading ? (
              <div className="flex justify-end">
                <div className="simpleO-loader"></div>
              </div>
            ) : (
              <div className={`flex ${currentPage > 1 ? "justify-between" : "justify-end"}`}>
                {currentPage > 1 && (
                  <div
                    className="dataTables_info"
                    id="myTable_info"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mt-3 mb-2 flex justify-center">
                      <button
                        className={`load-more-btn paginate_button next ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                        onClick={() => handleLoadMore(currentPage - 1)}
                      >
                        Load Previous
                      </button>
                    </div>
                  </div>
                )}
                {enableGoToPagination && (
                  <div className="flex items-center justify-end">
                    <div className="text-light-color fs12 font-bold mr-3">
                      Go To{" "}
                      <input
                        type="text"
                        value={inputPage}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputBlur}
                        onKeyDown={handlePageInputKeyDown}
                        min={1}
                        max={totalPages}
                        className="pagination-input"
                      />
                    </div>
                  </div>
                )}
                {currentPage === totalPages ? null : totalPages > 0 ? (
                  <div
                    className="dataTables_info flex"
                    id="myTable_info"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mt-3 mb-2 flex items-center justify-end">
                      <div className="text-light-color fs12 font-bold mr-3">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                    <div className="mt-3 mb-2 flex justify-center">
                      <button
                        className={`load-more-btn paginate_button next ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                        onClick={() => handleLoadMore(currentPage + 1)}
                      >
                        Load Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

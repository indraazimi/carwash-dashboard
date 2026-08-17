"use client";

import React, { useState, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export interface TableColumn<T> {
    header: string | React.ReactNode;
    accessorKey?: keyof T;
    render?: (row: T, index: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

export interface TableComponentProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    keyExtractor?: (item: T, index: number) => string | number;
    emptyMessage?: string;
    errorMessage?: string;
    className?: string;
    minWidth?: string;
    isLoading?: boolean;
    isError?: boolean;
    onRowClick?: (item: T) => void;
    // Pagination Props
    pagination?: boolean;
    pageSize?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    totalItems?: number;
}

function TableComponent<T>({
    columns,
    data,
    keyExtractor,
    emptyMessage = "Belum ada data",
    errorMessage = "Gagal memuat data, silahkan muat ulang halaman",
    className = "",
    minWidth = "min-w-[900px]",
    isLoading = false,
    isError = false,
    onRowClick,
    pagination = false,
    pageSize = 10,
    currentPage,
    onPageChange,
    totalItems
}: TableComponentProps<T>) {
    const [internalPage, setInternalPage] = useState(1);
    const activePage = currentPage ?? internalPage;
    const effectivePageSize = pageSize > 0 ? pageSize : 10;
    const totalCount = totalItems ?? data.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / effectivePageSize));

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        if (onPageChange) {
            onPageChange(newPage);
        } else {
            setInternalPage(newPage);
        }
    };

    // Auto-adjust page if current page exceeds total pages
    useEffect(() => {
        if (pagination && activePage > totalPages) {
            handlePageChange(totalPages);
        }
    }, [pagination, totalPages, activePage]);

    // Client-side slice if server pagination is not provided
    const displayedData = pagination && totalItems === undefined
        ? data.slice((activePage - 1) * effectivePageSize, activePage * effectivePageSize)
        : data;

    const getPaginationItems = (current: number, total: number) => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }
        if (current >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    return (
        <div className={`w-full space-y-4 ${className}`}>
            <div className="-m-1 p-1 overflow-x-auto">
                <div className={`space-y-2 ${minWidth}`}>
                    {/* Table Header Card */}
                    <div className="bg-white rounded-lg shadow-sm text-gray-700 uppercase">
                        <div className="flex items-end">
                            {columns.map((col, idx) => {
                                const isFlex = !col.className || col.className.includes('flex-1');
                                const colWidthClass = isFlex
                                    ? (col.className || 'flex-1 min-w-0')
                                    : `${col.className} shrink-0`;

                                return (
                                    <div
                                        key={idx}
                                        className={`p-4 font-medium ${colWidthClass} ${col.headerClassName || ''}`}
                                    >
                                        {col.header}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Table Body Card (Unified single card block with genuine full box-shadow and rounded corners) */}
                    <div className={`bg-white rounded-lg shadow-sm overflow-hidden divide-y divide-gray-200 ${isLoading ? 'animate-pulse' : ''}`}>
                        {isLoading ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center p-4">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                            ))
                        ) : isError ? (
                            <div className="p-8 text-center text-gray-500">
                                {errorMessage}
                            </div>
                        ) : displayedData.length > 0 ? (
                            displayedData.map((row, idx) => {
                                const originalIdx = pagination && totalItems === undefined
                                    ? (activePage - 1) * effectivePageSize + idx
                                    : idx;

                                const rowKey = keyExtractor
                                    ? keyExtractor(row, originalIdx)
                                    : (row as any).id ?? (row as any).bookingNumber ?? originalIdx;

                                return (
                                    <div
                                        key={rowKey}
                                        onClick={() => onRowClick?.(row)}
                                        className={`flex items-center hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''
                                            }`}
                                    >
                                        {columns.map((col, colIdx) => {
                                            const isFlex = !col.className || col.className.includes('flex-1');
                                            const colWidthClass = isFlex
                                                ? (col.className || 'flex-1 min-w-0')
                                                : `${col.className} shrink-0`;

                                            return (
                                                <div
                                                    key={colIdx}
                                                    className={`p-4 ${colWidthClass}`}
                                                >
                                                    {col.render
                                                        ? col.render(row, originalIdx)
                                                        : col.accessorKey
                                                            ? String(row[col.accessorKey] ?? '')
                                                            : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                {emptyMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination && !isLoading && !isError && totalCount > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
                    <div>
                        Menampilkan {Math.min(activePage * effectivePageSize, totalCount)} dari {totalCount} data
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => handlePageChange(activePage - 1)}
                            disabled={activePage <= 1}
                            className="h-8 w-8 flex justify-center items-center rounded-full bg-blue-500 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all cursor-pointer"
                            title="Halaman Sebelumnya"
                        >
                            <IconChevronLeft size={16} />
                        </button>

                        {getPaginationItems(activePage, totalPages).map((item, idx) => {
                            if (typeof item === 'string') {
                                return (
                                    <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 select-none">
                                        ...
                                    </span>
                                );
                            }
                            const isSelected = item === activePage;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => handlePageChange(item)}
                                    className={`h-8 w-8 rounded-full text-sm font-medium transition-all cursor-pointer ${isSelected
                                        ? 'bg-blue-50 border border-blue-500 text-blue-500 hover:bg-blue-100'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {item}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => handlePageChange(activePage + 1)}
                            disabled={activePage >= totalPages}
                            className="h-8 w-8 flex justify-center items-center rounded-full bg-blue-500 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all cursor-pointer"
                            title="Halaman Berikutnya"
                        >
                            <IconChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TableComponent;
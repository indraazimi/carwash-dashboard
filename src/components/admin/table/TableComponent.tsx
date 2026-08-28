"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    IconChevronLeft,
    IconChevronRight,
    IconSearch,
    IconX,
    IconArrowsSort,
    IconArrowUp,
    IconArrowDown
} from '@tabler/icons-react';

export interface TableColumn<T> {
    header: string | React.ReactNode;
    accessorKey?: keyof T;
    render?: (row: T, index: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
    sortable?: boolean;
    sortKey?: string | keyof T;
    sortFn?: (a: T, b: T, direction: 'asc' | 'desc') => number;
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
    // Search Props
    searchable?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearch?: (value: string) => void;
    debounceDelay?: number;
    filterFn?: (item: T, query: string) => boolean;
    // Sort Props
    defaultSortKey?: string | keyof T;
    defaultSortOrder?: 'asc' | 'desc';
    onSort?: (key: string | keyof T | null, order: 'asc' | 'desc' | null) => void;
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
    totalItems,
    searchable = false,
    searchPlaceholder = "Cari data",
    searchValue,
    onSearch,
    debounceDelay = 500,
    filterFn,
    defaultSortKey,
    defaultSortOrder,
    onSort
}: TableComponentProps<T>) {
    const [internalPage, setInternalPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState(searchValue ?? '');
    const [debouncedSearch, setDebouncedSearch] = useState(searchValue ?? '');
    const [sortKey, setSortKey] = useState<string | keyof T | null>(defaultSortKey ?? null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(defaultSortOrder ?? null);

    // Synchronize if controlled searchValue changes
    useEffect(() => {
        if (searchValue !== undefined) {
            setSearchTerm(searchValue);
            setDebouncedSearch(searchValue);
        }
    }, [searchValue]);

    // Debounce search effect
    useEffect(() => {
        if (!searchable) return;
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            onSearch?.(searchTerm);
        }, debounceDelay);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, debounceDelay, searchable, onSearch]);

    // Client-side filtering when server onSearch is not provided
    const filteredData = useMemo(() => {
        if (!searchable || onSearch || !debouncedSearch.trim()) {
            return data;
        }
        const q = debouncedSearch.toLowerCase().trim();
        if (filterFn) {
            return data.filter((item) => filterFn(item, q));
        }
        return data.filter((item) => {
            return (
                columns.some((col) => {
                    if (
                        col.accessorKey &&
                        item[col.accessorKey] !== undefined &&
                        item[col.accessorKey] !== null
                    ) {
                        return String(item[col.accessorKey]).toLowerCase().includes(q);
                    }
                    return false;
                }) ||
                Object.values(item as any).some((val) => {
                    if (val === null || val === undefined || typeof val === 'object') return false;
                    return String(val).toLowerCase().includes(q);
                })
            );
        });
    }, [data, searchable, onSearch, debouncedSearch, filterFn, columns]);

    // Client-side sorting
    const sortedData = useMemo(() => {
        if (!sortKey || !sortOrder || onSort) {
            return filteredData;
        }

        const activeCol = columns.find(
            (c) => (c.sortKey ?? c.accessorKey) === sortKey || c.header === sortKey
        );

        return [...filteredData].sort((a, b) => {
            if (activeCol?.sortFn) {
                return activeCol.sortFn(a, b, sortOrder);
            }

            const valA = (a as any)[sortKey];
            const valB = (b as any)[sortKey];

            if (valA === valB) return 0;
            if (valA === null || valA === undefined || valA === '') return 1;
            if (valB === null || valB === undefined || valB === '') return -1;

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }

            const strA = String(valA);
            const strB = String(valB);

            return sortOrder === 'asc'
                ? strA.localeCompare(strB, 'id-ID', { numeric: true, sensitivity: 'base' })
                : strB.localeCompare(strA, 'id-ID', { numeric: true, sensitivity: 'base' });
        });
    }, [filteredData, sortKey, sortOrder, onSort, columns]);

    const activePage = currentPage ?? internalPage;
    const effectivePageSize = pageSize > 0 ? pageSize : 10;
    const totalCount = totalItems ?? sortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / effectivePageSize));

    const handleSort = (col: TableColumn<T>) => {
        const key = (col.sortKey ?? col.accessorKey) as string | keyof T | undefined;
        const effectiveKey = key ?? (typeof col.header === 'string' ? col.header : '');
        if (!effectiveKey && !col.sortFn) return;

        let newOrder: 'asc' | 'desc' | null = 'asc';

        if (sortKey === effectiveKey) {
            if (sortOrder === 'asc') {
                newOrder = 'desc';
            } else if (sortOrder === 'desc') {
                newOrder = null;
            } else {
                newOrder = 'asc';
            }
        }

        const newKey = newOrder ? effectiveKey : null;
        setSortKey(newKey);
        setSortOrder(newOrder);
        onSort?.(newKey, newOrder);
        if (pagination) setInternalPage(1);
    };

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
        ? sortedData.slice((activePage - 1) * effectivePageSize, activePage * effectivePageSize)
        : sortedData;

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
                {/* Search Bar */}
                {searchable && (
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="relative w-full max-w-2xs">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                <IconSearch size={16} />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (pagination) setInternalPage(1);
                                }}
                                placeholder={searchPlaceholder}
                                className="w-full px-10 py-2 bg-white rounded-lg placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all text-sm"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        if (pagination) setInternalPage(1);
                                    }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 transition-colors cursor-pointer"
                                    title="Hapus pencarian"
                                >
                                    <IconX size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
                <div className={`space-y-2 ${minWidth}`}>
                    {/* Table Header Card */}
                    <div className="bg-white rounded-lg shadow-sm text-gray-700 uppercase">
                        <div className="flex items-end">
                            {columns.map((col, idx) => {
                                const isFlex = !col.className || col.className.includes('flex-1');
                                const colWidthClass = isFlex
                                    ? (col.className || 'flex-1 min-w-0')
                                    : `${col.className} shrink-0`;

                                const columnKey = (col.sortKey ?? col.accessorKey) as string | keyof T | undefined;
                                const isSortable = col.sortable ?? (Boolean(columnKey) || Boolean(col.sortFn));
                                const isActiveSort = isSortable && (
                                    sortKey === columnKey || (columnKey === undefined && sortKey === col.header)
                                );

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => isSortable && handleSort(col)}
                                        className={`p-4 font-medium select-none ${colWidthClass} ${col.headerClassName || ''} ${
                                            isSortable ? 'cursor-pointer hover:text-blue-600 transition-colors group' : ''
                                        }`}
                                    >
                                        <div className={`flex items-center gap-1.5 ${
                                            col.className?.includes('text-center')
                                                ? 'justify-center'
                                                : col.className?.includes('text-right')
                                                    ? 'justify-end'
                                                    : ''
                                        }`}>
                                            <span>{col.header}</span>
                                            {isSortable && (
                                                <span className={`transition-colors ${
                                                    isActiveSort ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                                                }`}>
                                                    {isActiveSort ? (
                                                        sortOrder === 'asc' ? (
                                                            <IconArrowUp size={14} />
                                                        ) : (
                                                            <IconArrowDown size={14} />
                                                        )
                                                    ) : (
                                                        <IconArrowsSort size={14} />
                                                    )}
                                                </span>
                                            )}
                                        </div>
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
                            className="h-8 w-8 flex justify-center items-center rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all cursor-pointer"
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
                                        ? 'text-black hover:bg-white'
                                        : 'text-gray-400 hover:bg-white hover:text-black'
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
                            className="h-8 w-8 flex justify-center items-center rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all cursor-pointer"
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
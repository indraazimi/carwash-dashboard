import React from 'react';

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
    className?: string;
    minWidth?: string;
    onRowClick?: (item: T) => void;
}

function TableComponent<T>({
    columns,
    data,
    keyExtractor,
    emptyMessage = "Belum ada data",
    className = "",
    minWidth = "min-w-[900px]",
    onRowClick
}: TableComponentProps<T>) {
    return (
        <div className={`w-full -m-1 p-1 overflow-x-auto pb-4 ${className}`}>
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
                <div className="bg-white rounded-lg shadow-sm overflow-hidden divide-y divide-gray-200">
                    {data.length > 0 ? (
                        data.map((row, idx) => {
                            const rowKey = keyExtractor
                                ? keyExtractor(row, idx)
                                : (row as any).id ?? (row as any).bookingNumber ?? idx;

                            return (
                                <div
                                    key={rowKey}
                                    onClick={() => onRowClick?.(row)}
                                    className={`flex items-center hover:bg-gray-50 transition-colors ${
                                        onRowClick ? 'cursor-pointer' : ''
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
                                                    ? col.render(row, idx)
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
    );
}

export default TableComponent;
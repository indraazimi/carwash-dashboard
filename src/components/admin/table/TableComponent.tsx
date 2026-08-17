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
        <div className={`w-full overflow-x-auto pb-2 ${className}`}>
            <div className={`space-y-2 ${minWidth}`}>
                {/* Table Header */}
                <div className="flex items-end bg-white rounded-lg shadow-sm font-semibold text-gray-700 uppercase">
                    {columns.map((col, idx) => (
                        <div
                            key={idx}
                            className={`p-4 ${col.className || 'flex-1'} ${col.headerClassName || ''}`}
                        >
                            {col.header}
                        </div>
                    ))}
                </div>

                {/* Table Rows Container (Single unified card) */}
                <div className="rounded-lg overflow-hidden shadow-sm bg-white">
                    {data.length > 0 ? (
                        data.map((row, idx) => {
                            const rowKey = keyExtractor
                                ? keyExtractor(row, idx)
                                : (row as any).id ?? (row as any).bookingNumber ?? idx;

                            return (
                                <div
                                    key={rowKey}
                                    onClick={() => onRowClick?.(row)}
                                    className={`flex items-center bg-white border-t first:border-t-0 border-gray-200 hover:bg-gray-50 transition-colors ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    {columns.map((col, colIdx) => (
                                        <div
                                            key={colIdx}
                                            className={`p-4 ${col.className || 'flex-1'}`}
                                        >
                                            {col.render
                                                ? col.render(row, idx)
                                                : col.accessorKey
                                                    ? String(row[col.accessorKey] ?? '')
                                                    : null}
                                        </div>
                                    ))}
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
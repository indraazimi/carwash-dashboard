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
            <table className={`w-full text-left border-separate border-spacing-y-2 ${minWidth}`}>
                <thead>
                    <tr className="bg-white rounded-lg shadow-sm">
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={`p-4 font-semibold text-gray-700 uppercase first:rounded-l-lg last:rounded-r-lg ${col.className || ''} ${col.headerClassName || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, idx) => {
                            const rowKey = keyExtractor
                                ? keyExtractor(row, idx)
                                : (row as any).id ?? (row as any).bookingNumber ?? idx;

                            return (
                                <tr
                                    key={rowKey}
                                    onClick={() => onRowClick?.(row)}
                                    className={`bg-white shadow-sm hover:bg-gray-50 transition-colors ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={`p-4 first:rounded-l-lg last:rounded-r-lg border-y first:border-l last:border-r border-transparent ${col.className || ''}`}
                                        >
                                            {col.render
                                                ? col.render(row, idx)
                                                : col.accessorKey
                                                    ? String(row[col.accessorKey] ?? '')
                                                    : null}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TableComponent;
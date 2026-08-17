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
            <table className={`w-full text-left border-separate border-spacing-0 ${minWidth}`}>
                {/* Table Header */}
                <thead>
                    <tr className="bg-white shadow-sm text-gray-700 uppercase align-bottom">
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={`p-4 font-medium align-bottom first:rounded-l-lg last:rounded-r-lg ${col.className || ''} ${col.headerClassName || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                    {/* Spacer between header and body */}
                    <tr className="h-2 pointer-events-none select-none">
                        <td colSpan={columns.length} className="p-0 h-2 bg-transparent border-0"></td>
                    </tr>
                </thead>

                {/* Table Body (Unified single card block) */}
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, idx) => {
                            const rowKey = keyExtractor
                                ? keyExtractor(row, idx)
                                : (row as any).id ?? (row as any).bookingNumber ?? idx;

                            const isFirst = idx === 0;
                            const isLast = idx === data.length - 1;

                            return (
                                <tr
                                    key={rowKey}
                                    onClick={() => onRowClick?.(row)}
                                    className={`bg-white hover:bg-gray-50 transition-colors ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    {columns.map((col, colIdx) => {
                                        const isFirstCol = colIdx === 0;
                                        const isLastCol = colIdx === columns.length - 1;

                                        // Apply rounded corners to outer edges of the body table block
                                        const roundedTl = isFirst && isFirstCol ? 'rounded-tl-lg' : '';
                                        const roundedTr = isFirst && isLastCol ? 'rounded-tr-lg' : '';
                                        const roundedBl = isLast && isFirstCol ? 'rounded-bl-lg' : '';
                                        const roundedBr = isLast && isLastCol ? 'rounded-br-lg' : '';
                                        const roundedClasses = `${roundedTl} ${roundedTr} ${roundedBl} ${roundedBr}`.trim();

                                        // Row separator border
                                        const borderClass = !isFirst ? 'border-t border-gray-200' : '';

                                        return (
                                            <td
                                                key={colIdx}
                                                className={`p-4 ${roundedClasses} ${borderClass} ${col.className || ''}`}
                                            >
                                                {col.render
                                                    ? col.render(row, idx)
                                                    : col.accessorKey
                                                        ? String(row[col.accessorKey] ?? '')
                                                        : null}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-sm"
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
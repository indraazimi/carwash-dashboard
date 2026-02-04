"use client"

import React, { useState, useEffect } from 'react'
import { DateRangePicker } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { useTransactionHistory } from '@/hooks/useTransactions'
import { formatOnlyDate, formatTimeDot } from '@/utils/getDate'
import TransactionSkeleton from '@/components/skeleton/TableSkeleton'
import ButtonComponent from '@/components/buttons/ButtonComponent'
import { IconCalendar, IconCalendarFilled, IconFileText } from '@tabler/icons-react'
import InvoiceModal from '@/components/InvoiceModal'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/Toast'

const RiwayatTransaksiPage = () => {
    // Get first and last day of current month
    const getMonthRange = () => {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return { firstDay, lastDay }
    }

    const { firstDay, lastDay } = getMonthRange()

    const [selectedRange, setSelectedRange] = useState([
        {
            startDate: firstDay,
            endDate: lastDay,
            key: 'selection'
        }
    ])
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const { toasts, showToast, removeToast } = useToast()
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

    const formatDateForApi = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const startDate = formatDateForApi(selectedRange[0].startDate);
    const endDate = formatDateForApi(selectedRange[0].endDate);

    const { data, isLoading, refetch } = useTransactionHistory(startDate, endDate);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const transactions = data?.transactions || [];

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === transactions.length && transactions.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(transactions.map(t => t.id))
        }
    }

    const selectedTransactions = transactions.filter(t => selectedIds.includes(t.id))

    const handleCreateInvoice = () => {
        if (selectedIds.length === 0) {
            showToast("Silakan pilih minimal satu transaksi", "error")
            return
        }
        setIsInvoiceModalOpen(true)
    }

    if (isLoading) return <TransactionSkeleton />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Riwayat Transaksi</h3>

                <div className="relative">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <span>
                            {formatDate(selectedRange[0].startDate)} - {formatDate(selectedRange[0].endDate)}
                        </span>
                        <IconCalendarFilled className='text-gray-700' />
                    </button>

                    {showDatePicker && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDatePicker(false)}
                            />
                            <div className="absolute right-0 mt-2 z-20 shadow-xl rounded-lg overflow-hidden border border-gray-200">
                                <DateRangePicker
                                    onChange={item => {
                                        if (item.selection.startDate && item.selection.endDate) {
                                            setSelectedRange([{
                                                startDate: item.selection.startDate,
                                                endDate: item.selection.endDate,
                                                key: 'selection'
                                            }])
                                        }
                                    }}
                                    ranges={selectedRange}
                                    showDateDisplay={false}
                                    months={1}
                                    direction="horizontal"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className='flex bg-white rounded-lg shadow-sm font-semibold'>
                    <div className="p-4 w-12 flex justify-center items-center">
                        <input
                            type="checkbox"
                            checked={transactions.length > 0 && selectedIds.length === transactions.length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                    </div>
                    <div className='p-4 flex items-center justify-between w-full'>
                        <div>
                            Pilih Semua ({selectedIds.length} dipilih)
                        </div>
                        <ButtonComponent
                            isPrimary={true}
                            isFullWidth={false}
                            isIconEnable={true}
                            icon={<IconFileText />}
                            onClick={handleCreateInvoice}
                            isRed={false}
                            label="Buat Invoice"
                        />
                    </div>
                </div>
                {/* Table Header */}
                <div className="flex bg-white rounded-lg shadow-sm font-semibold text-gray-700">
                    <div className="p-4 w-12 flex justify-center">
                        {/* <input
                            type="checkbox"
                            checked={transactions.length > 0 && selectedIds.length === transactions.length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        /> */}
                    </div>
                    <div className="p-4 w-28">ID</div>
                    <div className="p-4 flex-1">TANGGAL & WAKTU</div>
                    <div className="p-4 w-40">KENDARAAN</div>
                    <div className="p-4 flex-1">CUSTOMER</div>
                    <div className="p-4 flex-1">LAYANAN</div>
                    <div className="p-4 w-40">HARGA</div>
                </div>

                {/* Table Rows */}
                <div className="rounded-lg overflow-hidden shadow-sm">
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center bg-white border-t border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <div className="p-4 w-12 flex justify-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(transaction.id)}
                                        onChange={() => toggleSelection(transaction.id)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                                <div className="p-4 w-28 flex flex-col">
                                    <span className="font-medium text-gray-900 uppercase">
                                        {transaction.bookingNumber}
                                    </span>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <span className="font-medium text-gray-900">
                                        {formatOnlyDate(transaction.date)}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        {formatTimeDot(transaction.date)}
                                    </span>
                                </div>
                                <div className="p-4 w-40 flex flex-col">
                                    <span className="font-medium text-gray-900 uppercase">
                                        {transaction.vehiclePlate}
                                    </span>
                                    <span className="text-gray-500 text-sm capitalize">
                                        {transaction.vehicleType.toLowerCase()}
                                    </span>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <span className="font-medium text-gray-900">
                                        {transaction.customerName}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        {transaction.customerPhone}
                                    </span>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <span className="font-medium text-gray-900">
                                        {transaction.serviceName}
                                    </span>
                                </div>
                                <div className="p-4 w-40 flex flex-col">
                                    <span className="font-medium">
                                        {formatCurrency(transaction.servicePrice)}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-10 text-center text-gray-500">
                            Tidak ada riwayat transaksi pada periode ini
                        </div>
                    )}
                </div>
            </div>

            <InvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                transactions={selectedTransactions}
            />

            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    )
}

export default RiwayatTransaksiPage
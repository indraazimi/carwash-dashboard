"use client";

import { IconDownload, IconPrinter, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { TransactionHistory } from "@/types/transaction";
import { formatOnlyDate } from "@/utils/getDate";
import { useEffect, useState } from "react";
import { transactionService } from "@/services/transactionService";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import ButtonComponent from "./buttons/ButtonComponent";

type InvoiceModalProps = {
    isOpen: boolean;
    onClose: () => void;
    transactions: TransactionHistory[];
};

const InvoiceModal = ({ isOpen, onClose, transactions }: InvoiceModalProps) => {
    const { toasts, showToast, removeToast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const subtotal = transactions.reduce((acc, curr) => acc + curr.servicePrice, 0);
    const total = subtotal;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        if (transactions.length === 0) return;

        setIsDownloading(true);
        try {
            const bookingIds = transactions.map(t => t.id);
            const blob = await transactionService.downloadInvoice(bookingIds);

            // Create a link element and trigger download
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${new Date().getTime()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            showToast("Invoice berhasil diunduh", "success");
        } catch (error: any) {
            console.error("Download error:", error);
            showToast("Gagal mengunduh invoice", "error");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 h-screen">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-[#F8F9FA] rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-300 print:hidden">
                    <h2 className="text-xl font-bold text-gray-800">Invoice Bulanan</h2>
                    <div className="flex items-center gap-2">
                        <ButtonComponent
                            label="Download"
                            onClick={handleDownload}
                            isPrimary={true}
                            icon={<IconDownload size={20} />}
                        />
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                            <IconX size={24} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Printable Content Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-white print:p-0 print:overflow-visible">
                    <div id="invoice-content" className="bg-white">

                        {/* Table */}
                        <div className="border border-gray-300 overflow-hidden mb-8">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-200 text-start border-b border-gray-300">
                                        <th className="p-3 text-sm text-start font-bold border-gray-300 w-[20%]">TANGGAL</th>
                                        <th className="p-3 text-sm text-start font-bold border-gray-300 w-[20%]">CUSTOMER</th>
                                        <th className="p-3 text-sm text-start font-bold border-gray-300 w-[20%]">KENDARAAN</th>
                                        <th className="p-3 text-sm text-start font-bold border-gray-300 w-[25%]">LAYANAN</th>
                                        <th className="p-3 text-sm font-bold w-[15%]">HARGA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t, idx) => (
                                        <tr key={idx} className={`border-b border-gray-300 last:border-0 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                                            <td className="p-3 text-sm border-gray-300">{formatOnlyDate(t.date)}</td>
                                            <td className="p-3 text-sm border-gray-300">{t.customerName}</td>
                                            <td className="p-3 text-sm border-gray-300">
                                                {t.vehiclePlate} ({t.vehicleType.charAt(0).toUpperCase() + t.vehicleType.slice(1).toLowerCase()})
                                            </td>
                                            <td className="p-3 text-sm border-gray-300">{t.serviceName}</td>
                                            <td className="p-3 text-center text-sm">Rp {t.servicePrice.toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary */}
                        <div className="flex flex-col items-end gap-2">
                            {/* <div className="grid grid-cols-2 gap-x-12 min-w-[300px] border-t border-b border-gray-300 pt-4 pb-4">
                                <span className="text-gray-500 text-sm">Subtotal:</span>
                                <span className="text-gray-500 text-right">Rp {subtotal.toLocaleString('id-ID')}</span>
                            </div> */}
                            <div className="grid grid-cols-2 gap-x-12 min-w-[300px] pt-2">
                                <span className="text-gray-900 font-bold">Total:</span>
                                <span className="text-right text-gray-900 text-xl font-bold">Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-content, #invoice-content * {
                        visibility: visible;
                    }
                    #invoice-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>

            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default InvoiceModal;

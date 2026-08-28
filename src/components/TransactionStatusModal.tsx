"use client";

import { useState } from "react";
import Image from "next/image";
import { IconCashBanknote, IconX } from "@tabler/icons-react";
import { Transaction } from "@/types/transaction";
import VehicleStatus from "./vehicle/VehicleStatus";
import { useUpdatePaymentMethod } from "@/hooks/useTransactions";

type TransactionStatusModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number, status: string) => Promise<void> | void;
    onUpdatePaymentMethod?: (id: number, paymentMethod: string) => Promise<void> | void;
    transaction: Transaction | null;
};

const statusOptions = [
    { id: "BOOKED", name: "Dibooking" },
    { id: "DITERIMA", name: "Diterima" },
    { id: "DICUCI", name: "Sedang Dicuci" },
    { id: "SIAP_DIAMBIL", name: "Siap Diambil" },
    { id: "SELESAI", name: "Selesai" },
];

const TransactionStatusModal = ({
    isOpen,
    onClose,
    onSubmit,
    onUpdatePaymentMethod,
    transaction,
}: TransactionStatusModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const updatePaymentMethodMutation = useUpdatePaymentMethod();

    const handleStatusClick = async (newStatus: string) => {
        if (!transaction || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(transaction.id, newStatus);
            onClose();
        } catch (error) {
            console.error("Update status error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentMethodClick = async (paymentMethod: string) => {
        if (!transaction || isSubmittingPayment) return;

        setIsSubmittingPayment(true);
        try {
            if (onUpdatePaymentMethod) {
                await onUpdatePaymentMethod(transaction.id, paymentMethod);
            } else {
                await updatePaymentMethodMutation.mutateAsync({
                    id: transaction.id,
                    paymentMethod,
                });
            }
        } catch (error) {
            console.error("Update payment method error:", error);
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    if (!isOpen || !transaction) return null;

    const currentPaymentMethod = transaction.paymentMethod?.toUpperCase();
    const isQrisActive = currentPaymentMethod === "QRIS";
    const isCashActive = currentPaymentMethod === "TUNAI" || currentPaymentMethod === "CASH";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-screen">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                        Update Transaksi
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <IconX size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-5">
                    <div className="mb-4">
                        <p className="text-gray-500">Kendaraan: <span className="text-black">{transaction.vehiclePlate}</span></p>
                        <p className="text-gray-500">Customer: <span className="text-black">{transaction.customerName}</span></p>
                    </div>

                    <div className="space-y-2">
                        <h2 className="font-semibold">Metode Pembayaran</h2>
                        <button
                            type="button"
                            onClick={() => handlePaymentMethodClick("QRIS")}
                            disabled={isSubmittingPayment}
                            className={`flex gap-2 items-center justify-between p-2 border rounded-lg w-full transition-all cursor-pointer font-medium ${isQrisActive
                                    ? "bg-blue-50 border-blue-500"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white"
                                } ${isSubmittingPayment ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <span className={isQrisActive ? "text-blue-500" : ""}>QRIS</span>
                            <Image src="/images/qris-logo.webp" height={32} width={64} className="py-1" alt="QRIS Logo" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePaymentMethodClick("TUNAI")}
                            disabled={isSubmittingPayment}
                            className={`flex gap-2 items-center justify-between p-2 border rounded-lg w-full transition-all cursor-pointer font-medium ${isCashActive
                                    ? "bg-blue-50 border-blue-500"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white"
                                } ${isSubmittingPayment ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <span className={isCashActive ? "text-blue-500" : ""}>Tunai</span>
                            <IconCashBanknote size={32} className={isCashActive ? "text-blue-600" : "text-gray-500"} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h2 className="font-semibold">Status Pencucian</h2>
                        {statusOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleStatusClick(option.id)}
                                disabled={isSubmitting}
                                className={`flex items-center justify-between p-2 border rounded-lg gap-2 w-full ${transaction.status === option.id
                                    ? "bg-blue-50 border-blue-500"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white"
                                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                <span className={`font-medium ${transaction.status === option.id ? "text-blue-500" : "text-black"}`}>
                                    {option.name}
                                </span>
                                <VehicleStatus status={option.id} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionStatusModal;

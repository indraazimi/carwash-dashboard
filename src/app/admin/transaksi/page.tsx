"use client";
import { useState, useEffect } from "react";
import { IconEdit } from "@tabler/icons-react";
import { useTransactions, useUpdateTransactionStatus } from "@/hooks/useTransactions";
import TransactionSkeleton from "@/components/skeleton/TableSkeleton";
import { formatTime } from "@/utils/getDate";
import { Transaction } from "@/types/transaction";
import TransactionStatusModal from "@/components/TransactionStatusModal";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import VehicleStatus from "@/components/vehicle/VehicleStatus";

const TransactionPage = () => {
  const { toasts, showToast, removeToast } = useToast();
  const [filterType, setFilterType] = useState<"today" | "tomorrow">("today");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Calculate tomorrow's date in YYYY-MM-DD (UTC+7)
  const getTomorrowDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const selectedDate = filterType === "tomorrow" ? getTomorrowDate() : "";
  const { data, isLoading, refetch } = useTransactions(selectedDate);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateStatusMutation = useUpdateTransactionStatus();

  const transactions = data?.transactions || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleOpenStatusModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await updateStatusMutation.mutateAsync({ id, status });
      showToast(res.message || "Status berhasil diperbarui", "success");
    } catch (error: any) {
      console.error("Failed to update status:", error);
      showToast(error.response?.data?.message || "Gagal memperbarui status", "error");
    }
  };

  if (isLoading) return <TransactionSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Transaksi Kendaraan</h3>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "today" | "tomorrow")}
            className="w-48 p-2 bg-white border border-gray-300 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
          >
            <option value="today">Hari Ini</option>
            <option value="tomorrow">Besok</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {/* Table Header */}
        <div className="flex bg-white rounded-lg shadow-sm font-semibold text-gray-700">
          <div className="p-4 w-28">ID</div>
          <div className="p-4 w-40">KENDARAAN</div>
          <div className="p-4 flex-1">CUSTOMER</div>
          <div className="p-4 flex-1">LAYANAN</div>
          <div className="p-4 flex-1">WAKTU</div>
          <div className="p-4 w-40 text-center">STATUS</div>
          <div className="p-4 w-44 text-center">AKSI</div>
        </div>

        {/* Table Rows */}
        <div className="rounded-lg overflow-hidden shadow-sm">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.bookingNumber}
                className="flex items-center bg-white border-t border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="p-4 w-28 flex flex-col">
                  <span className="font-medium text-gray-900 uppercase">{transaction.bookingNumber}</span>
                </div>
                <div className="p-4 w-40 flex flex-col">
                  <span className="font-medium text-gray-900 uppercase">{transaction.vehiclePlate}</span>
                  <span className="text-gray-500 text-sm capitalize">{transaction.vehicleType}</span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="font-medium text-gray-900">{transaction.customerName}</span>
                  <span className="text-gray-500 text-sm">{transaction.customerPhone}</span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="font-medium text-gray-900">{transaction.serviceName}</span>
                  <span className="text-gray-500 text-sm">{formatCurrency(transaction.servicePrice)}</span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="font-medium text-gray-900">{formatTime(transaction.bookingTime)}</span>
                  <span className="text-gray-500 text-sm">Estimasi Selesai: {formatTime(transaction.estimateFinish)}</span>
                </div>
                <div className="p-4 w-40 text-center justify-center flex">
                  <VehicleStatus status={transaction.status} />
                </div>
                <div className="p-4 w-44 flex justify-center">
                  <button
                    onClick={() => handleOpenStatusModal(transaction)}
                    disabled={transaction.status === "SELESAI"}
                    className={`p-2 flex items-center gap-2 rounded-lg transition-colors text-sm font-medium ${transaction.status === "SELESAI"
                      ? "bg-gray-400 text-gray-200"
                      : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                      }`}
                  >
                    <IconEdit size={16} /> Update Status
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-sm text-center text-gray-500">
              Tidak ada transaksi
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <TransactionStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleUpdateStatus}
        transaction={selectedTransaction}
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default TransactionPage;

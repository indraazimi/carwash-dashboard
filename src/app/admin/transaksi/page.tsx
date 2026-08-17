"use client";
import { useState, useEffect } from "react";
import { IconEdit } from "@tabler/icons-react";
import { useTransactions, useUpdateTransactionStatus } from "@/hooks/useTransactions";
import { formatTime } from "@/utils/getDate";
import { Transaction } from "@/types/transaction";
import TransactionStatusModal from "@/components/TransactionStatusModal";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import VehicleStatus from "@/components/vehicle/VehicleStatus";
import TableComponent, { TableColumn } from "@/components/admin/table/TableComponent";
import ButtonComponent from "@/components/buttons/ButtonComponent";

const TransactionPage = () => {
  const { toasts, showToast, removeToast } = useToast();
  const [filterType, setFilterType] = useState<"today" | "tomorrow">("today");
  const [page, setPage] = useState(1);
  const pageSize = 10;
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
  const { data: response, isLoading, isError, refetch } = useTransactions(selectedDate, page, pageSize);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateStatusMutation = useUpdateTransactionStatus();

  const transactions = response?.data?.transactions || [];
  const pagination = response?.pagination;

  const handleFilterChange = (newFilter: "today" | "tomorrow") => {
    setFilterType(newFilter);
    setPage(1);
  };

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

  const columns: TableColumn<Transaction>[] = [
    {
      header: "ID",
      className: "w-28",
      render: (transaction) => (
        <span className="font-medium text-gray-900 uppercase">{transaction.bookingNumber}</span>
      ),
    },
    {
      header: "KENDARAAN",
      className: "w-44",
      render: (transaction) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 uppercase">{transaction.vehiclePlate}</span>
          <span className="text-gray-500 text-sm capitalize">{transaction.vehicleType}</span>
        </div>
      ),
    },
    {
      header: "CUSTOMER",
      className: "w-48",
      render: (transaction) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{transaction.customerName}</span>
          <span className="text-gray-500 text-sm">{transaction.customerPhone}</span>
        </div>
      ),
    },
    {
      header: "LAYANAN",
      className: "flex-1",
      render: (transaction) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{transaction.serviceName}</span>
          <span className="text-gray-500 text-sm">{formatCurrency(transaction.servicePrice)}</span>
        </div>
      ),
    },
    {
      header: "WAKTU",
      className: "w-48",
      render: (transaction) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{formatTime(transaction.bookingTime)}</span>
          <span className="text-gray-500 text-sm">Estimasi Selesai: {formatTime(transaction.estimateFinish)}</span>
        </div>
      ),
    },
    {
      header: "PEMBAYARAN",
      className: "w-36 text-center",
      render: (transaction) => (
        <span className="font-medium text-gray-800">{transaction.paymentMethod || "-"}</span>
      ),
    },
    {
      header: "STATUS",
      className: "w-36 text-center",
      render: (transaction) => (
        <div className="flex justify-center">
          <VehicleStatus status={transaction.status} />
        </div>
      ),
    },
    {
      header: "AKSI",
      className: "w-44 text-center",
      render: (transaction) => (
        <div className="flex justify-center">
          <ButtonComponent
            label="Update Status"
            icon={<IconEdit size={16} />}
            isPrimary={true}
            onClick={() => handleOpenStatusModal(transaction)}
            disabled={transaction.status === "SELESAI"}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Transaksi Kendaraan</h3>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value as "today" | "tomorrow")}
            className="w-48 p-2 bg-white border border-gray-300 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
          >
            <option value="today">Hari Ini</option>
            <option value="tomorrow">Besok</option>
          </select>
        </div>
      </div>

      <TableComponent
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        isError={isError}
        minWidth="min-w-[1300px]"
        emptyMessage="Tidak ada transaksi"
        keyExtractor={(item) => item.bookingNumber}
        pagination={true}
        pageSize={pagination?.itemsPerPage || pageSize}
        currentPage={pagination?.currentPage || page}
        totalItems={pagination?.totalItems}
        onPageChange={(newPage) => setPage(newPage)}
      />

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

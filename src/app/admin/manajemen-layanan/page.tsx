"use client";

import React, { useState } from 'react';
import TableComponent, { TableColumn } from '@/components/admin/table/TableComponent';
import ButtonComponent from '@/components/buttons/ButtonComponent';
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import Toast from '@/components/Toast';
import ServiceModal, { ServiceFormData } from '@/components/ServiceModal';
import { useToast } from '@/hooks/useToast';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServices';
import { Service, CreateServiceRequest } from '@/types/service';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

const formatCcRange = (minCc?: number | null, maxCc?: number | null): string => {
    if (minCc === 0 && maxCc && maxCc > 0) {
        return `<=${maxCc} CC`;
    }
    if (minCc && minCc > 0 && (maxCc === null || maxCc === undefined)) {
        return `>=${minCc} CC`;
    }
    if (minCc && minCc > 0 && maxCc && maxCc > 0) {
        return `${minCc} CC - ${maxCc} CC`;
    }
    if (minCc && !maxCc) {
        return `>=${minCc} CC`;
    }
    if ((minCc === 0 || minCc === null || minCc === undefined) && maxCc) {
        return `<=${maxCc} CC`;
    }
    return "-";
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

const ManajemenLayananPage = () => {
    const { toasts, showToast, removeToast } = useToast();
    const { data: services = [], isLoading, refetch } = useServices();
    const createServiceMutation = useCreateService();
    const updateServiceMutation = useUpdateService();
    const deleteServiceMutation = useDeleteService();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedService, setSelectedService] = useState<ServiceFormData | null>(null);

    const handleDelete = async (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
            try {
                const res = await deleteServiceMutation.mutateAsync(id);
                showToast(res.message || "Layanan berhasil dihapus", "success");
            } catch (error: any) {
                console.error("Gagal menghapus layanan:", error);
                showToast(error.response?.data?.message || "Gagal menghapus layanan", "error");
            }
        }
    };

    const handleOpenAddModal = () => {
        setModalMode("add");
        setSelectedService(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (service: Service) => {
        setModalMode("edit");
        setSelectedService({
            id: service.id,
            name: service.name,
            description: service.description || "",
            price: service.price.toString(),
            vehicleType: (service.vehicleType || "MOBIL").toUpperCase(),
            minCc: service.minCc !== null && service.minCc !== undefined ? service.minCc.toString() : "",
            maxCc: service.maxCc !== null && service.maxCc !== undefined ? service.maxCc.toString() : "",
        });
        setIsModalOpen(true);
    };

    const handleSaveService = async (payload: CreateServiceRequest) => {
        try {
            if (modalMode === "edit" && selectedService?.id) {
                const res = await updateServiceMutation.mutateAsync({
                    id: selectedService.id,
                    data: payload,
                });
                showToast(res.message || "Layanan berhasil diperbarui", "success");
            } else {
                const res = await createServiceMutation.mutateAsync(payload);
                showToast(res.message || "Layanan berhasil ditambahkan", "success");
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Gagal menyimpan layanan:", error);
            showToast(error.response?.data?.message || "Gagal menyimpan layanan", "error");
        }
    };

    const columns: TableColumn<Service>[] = [
        {
            header: "NO",
            className: "w-16 text-center",
            render: (_item, index) => (
                <span className="font-medium">{index + 1}</span>
            ),
        },
        {
            header: "NAMA LAYANAN",
            className: "flex-1",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    {item.description && (
                        <span className="text-gray-500 text-xs line-clamp-1">{item.description}</span>
                    )}
                </div>
            ),
        },
        {
            header: "HARGA",
            className: "w-36",
            render: (item) => (
                <span className="font-medium">
                    {formatCurrency(item.price)}
                </span>
            ),
        },
        {
            header: "TIPE KENDARAAN",
            className: "w-36",
            render: (item) => (
                <span className="capitalize font-medium">
                    {item.vehicleType ? item.vehicleType.toLowerCase() : "-"}
                </span>
            ),
        },
        {
            header: "CC",
            className: "w-44",
            render: (item) => (
                <span className="font-medium">
                    {formatCcRange(item.minCc, item.maxCc)}
                </span>
            ),
        },
        {
            header: "AKSI",
            className: "w-28 text-center",
            render: (item) => (
                <div className="flex justify-center gap-1">
                    <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 rounded-full hover:bg-blue-50 transition-all group cursor-pointer"
                        title="Edit Layanan"
                    >
                        <IconEdit size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-full hover:bg-red-50 transition-all group cursor-pointer"
                        title="Hapus Layanan"
                    >
                        <IconTrash size={16} className="text-red-500 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            ),
        },
    ];

    if (isLoading) return <TableSkeleton />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Manajemen Layanan</h3>
                <ButtonComponent
                    label="Tambah Layanan"
                    isPrimary={true}
                    icon={<IconPlus size={20} />}
                    onClick={handleOpenAddModal}
                />
            </div>

            <TableComponent
                columns={columns}
                data={services}
                emptyMessage="Tidak ada layanan"
                keyExtractor={(item) => item.id}
            />

            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveService}
                isLoading={createServiceMutation.isPending || updateServiceMutation.isPending}
                mode={modalMode}
                initialData={selectedService || undefined}
            />

            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default ManajemenLayananPage;
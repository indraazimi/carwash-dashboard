"use client";

import { useState } from "react";
import StatsCard from "@/components/StatsCard";
import TenantModal, { TenantFormData } from "@/components/TenantModal";
import TableComponent, { TableColumn } from "@/components/admin/table/TableComponent";
import {
  IconBuildingStore,
  IconCheck,
  IconEdit,
  IconPlus,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";

import { useSuperadminLocations, useUpdateLocation, useCreateLocation, useDeleteLocation } from "@/hooks/useLocations";
import { Location } from "@/types/location";
import ManagementSkeleton from "@/components/skeleton/ManagementSkeleton";
import ButtonComponent from "@/components/buttons/ButtonComponent";
import Toast from "@/components/Toast";
import ErrorView from "@/components/ErrorView";
import { useToast } from "@/hooks/useToast";

const ManagementTenantPage = () => {
  const { data, isLoading, isError, refetch } = useSuperadminLocations();
  const updateLocationMutation = useUpdateLocation();
  const createLocationMutation = useCreateLocation();
  const deleteLocationMutation = useDeleteLocation();
  const { toasts, showToast, removeToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editData, setEditData] = useState<TenantFormData | undefined>();

  const handleOpenAddModal = () => {
    setModalMode("add");
    setEditData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tenant: Location) => {
    setModalMode("edit");
    // Mapping Location to TenantFormData
    setEditData({
      id: tenant.id,
      name: tenant.name,
      address: tenant.address,
      phone: tenant.phone,
      email: "", // email is not in Location response, setting empty
      isActive: tenant.isActive,
      latitude: tenant.latitude,
      longitude: tenant.longitude,
      photoUrl: tenant.photoUrl,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: TenantFormData) => {
    if (modalMode === "add") {
      try {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("address", formData.address);
        data.append("phone", formData.phone);
        data.append("isActive", formData.isActive.toString());
        data.append("latitude", formData.latitude);
        data.append("longitude", formData.longitude);

        if (formData.photoFile) {
          data.append("photo", formData.photoFile);
        }

        await createLocationMutation.mutateAsync(data);
        showToast("Berhasil menambahkan tenant baru", "success");
      } catch (error: any) {
        const message = error.response?.data?.message || "Gagal menambahkan tenant";
        showToast(message, "error");
        console.error("Failed to create tenant:", error);
        throw error;
      }
    } else {
      if (formData.id) {
        try {
          const data = new FormData();
          data.append("name", formData.name);
          data.append("address", formData.address);
          data.append("phone", formData.phone);
          data.append("isActive", formData.isActive.toString());
          data.append("latitude", formData.latitude);
          data.append("longitude", formData.longitude);

          if (formData.photoFile) {
            data.append("photo", formData.photoFile);
          }

          await updateLocationMutation.mutateAsync({
            id: formData.id,
            data: data,
          });
          showToast("Berhasil memperbarui data tenant", "success");
        } catch (error: any) {
          const message = error.response?.data?.message || "Gagal memperbarui data tenant";
          showToast(message, "error");
          console.error("Failed to update tenant:", error);
          throw error;
        }
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus tenant ini?")) {
      try {
        await deleteLocationMutation.mutateAsync(id);
        showToast("Tenant berhasil dihapus", "success");
      } catch (error: any) {
        const message = error.response?.data?.message || "Gagal menghapus tenant";
        showToast(message, "error");
        console.error("Failed to delete tenant:", error);
      }
    }
  };

  const columns: TableColumn<Location>[] = [
    {
      header: "TENANT",
      className: "flex-1",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{item.name}</span>
          <span className="text-gray-500 text-sm">{item.address}</span>
        </div>
      ),
    },
    {
      header: "KONTAK",
      className: "flex-1",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{item.phone}</span>
        </div>
      ),
    },
    {
      header: "STATUS",
      className: "w-32 text-center",
      render: (item) => (
        <div className="flex justify-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              item.isActive
                ? "bg-green-100 text-green-500 border border-green-500"
                : "bg-red-100 text-red-500 border border-red-500"
            }`}
          >
            {item.isActive ? "Aktif" : "Tidak Aktif"}
          </span>
        </div>
      ),
    },
    {
      header: "ADMIN",
      className: "w-28 text-center",
      render: (item) => (
        <span className="text-gray-700 font-medium">{item.totalAdmin}</span>
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
            title="Edit Tenant"
          >
            <IconEdit size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-2 rounded-full hover:bg-red-50 transition-all group cursor-pointer"
            title="Hapus Tenant"
          >
            <IconTrash size={16} className="text-red-500 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <ManagementSkeleton />;
  }

  if (isError) {
    return <ErrorView onRetry={() => refetch()} />;
  }

  const locations = data?.locations || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Manajemen Tenant</h3>
        <ButtonComponent
          label="Tambah Tenant"
          onClick={handleOpenAddModal}
          isPrimary={true}
          isFullWidth={false}
          type="button"
          icon={<IconPlus size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          label="Total Tenant"
          amount={data?.totalLocation || 0}
          isChange={false}
          icon={<IconBuildingStore />}
        />
        <StatsCard
          label="Tenant Aktif"
          amount={data?.totalActiveLocation || 0}
          isChange={false}
          icon={<IconCheck />}
        />
        <StatsCard
          label="Total Admin"
          amount={data?.totalAdmin || 0}
          isChange={false}
          icon={<IconUsers />}
        />
        <StatsCard
          label="Tenant Baru (Bulan ini)"
          amount={data?.totalNewTenantsThisMonth || 0}
          isChange={false}
          icon={<IconPlus />}
        />
      </div>

      <TableComponent
        columns={columns}
        data={locations}
        emptyMessage="Belum ada data tenant."
        keyExtractor={(item) => item.id}
      />

      {/* Tenant Modal (Add/Edit) */}
      <TenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={editData}
      />

      <Toast
        toasts={toasts}
        onRemove={removeToast}
      />
    </div>
  );
};

export default ManagementTenantPage;
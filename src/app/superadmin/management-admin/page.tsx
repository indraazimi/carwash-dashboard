"use client";

import { useState } from "react";
import StatsCard from "@/components/StatsCard";
import AdminModal, { AdminFormData } from "@/components/AdminModal";
import TableComponent, { TableColumn } from "@/components/admin/table/TableComponent";
import {
  IconCheck,
  IconEdit,
  IconLogin,
  IconPlus,
  IconTrash,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

import { useAdmins, useUpdateAdmin, useCreateAdmin, useDeleteAdmin } from "@/hooks/useAdmins";
import { useSuperadminLocations } from "@/hooks/useLocations";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import ErrorView from "@/components/ErrorView";
import { Admin } from "@/types/admin";
import { formatDateTime } from "@/utils/getDate";
import ButtonComponent from "@/components/buttons/ButtonComponent";

const ManagementAdminPage = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: response, isLoading, isError, refetch } = useAdmins(page, pageSize);
  const { data: tenantData } = useSuperadminLocations();
  const updateAdminMutation = useUpdateAdmin();
  const createAdminMutation = useCreateAdmin();
  const deleteAdminMutation = useDeleteAdmin();
  const { toasts, showToast, removeToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editData, setEditData] = useState<AdminFormData | undefined>();

  const handleOpenAddModal = () => {
    setModalMode("add");
    setEditData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin: Admin) => {
    setModalMode("edit");
    setEditData({
      id: admin.id,
      username: admin.username,
      password: "",
      fullName: admin.name,
      email: admin.email,
      phone: admin.phone,
      tenantId: admin.locationId.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: AdminFormData) => {
    if (modalMode === "add") {
      try {
        const createData = {
          name: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          locationId: parseInt(formData.tenantId),
        };

        await createAdminMutation.mutateAsync(createData);
        showToast("Berhasil menambahkan admin baru", "success");
      } catch (error: any) {
        const message = error.response?.data?.message || "Gagal menambahkan admin";
        showToast(message, "error");
        console.error("Failed to create admin:", error);
        throw error;
      }
    } else {
      if (formData.id) {
        try {
          const updateData: any = {
            name: formData.fullName,
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            locationId: parseInt(formData.tenantId),
          };

          // Include password only if it's not empty
          if (formData.password?.trim() !== "") {
            updateData.password = formData.password;
          }

          await updateAdminMutation.mutateAsync({
            id: formData.id,
            data: updateData,
          });
          showToast("Berhasil memperbarui data admin", "success");
        } catch (error: any) {
          const message = error.response?.data?.message || "Gagal memperbarui data admin";
          showToast(message, "error");
          console.error("Failed to update admin:", error);
          throw error;
        }
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus admin ini?")) {
      try {
        await deleteAdminMutation.mutateAsync(id);
        showToast("Berhasil menghapus admin", "success");
      } catch (error: any) {
        const message = error.response?.data?.message || "Gagal menghapus admin";
        showToast(message, "error");
        console.error("Failed to delete admin:", error);
      }
    }
  };

  const columns: TableColumn<Admin>[] = [
    {
      header: "ADMIN",
      className: "flex-1",
      render: (admin) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{admin.name}</span>
          <span className="text-gray-500 text-sm">{admin.username}</span>
        </div>
      ),
    },
    {
      header: "KONTAK",
      className: "flex-1",
      render: (admin) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{admin.phone}</span>
          <span className="text-gray-500 text-sm">{admin.email}</span>
        </div>
      ),
    },
    {
      header: "TENANT",
      className: "flex-1",
      render: (admin) => (
        <span className="font-medium text-gray-900">{admin.location}</span>
      ),
    },
    {
      header: "STATUS",
      className: "w-32 text-center",
      render: (admin) => (
        <div className="flex justify-center">
          <span
            className={`px-2 py-1 rounded-full text-xs border font-medium ${
              admin.isActive
                ? "bg-green-100 text-green-500 border border-green-500"
                : "bg-red-100 text-red-500 border border-red-500"
            }`}
          >
            {admin.isActive ? "Aktif" : "Tidak Aktif"}
          </span>
        </div>
      ),
    },
    {
      header: "LOGIN TERAKHIR",
      className: "w-52 text-center",
      render: (admin) => (
        <span className="text-gray-700">
          {admin.lastLogin ? formatDateTime(admin.lastLogin) : "Belum pernah login"}
        </span>
      ),
    },
    {
      header: "AKSI",
      className: "w-28 text-center",
      render: (admin) => (
        <div className="flex justify-center gap-1">
          <button
            onClick={() => handleOpenEditModal(admin)}
            className="p-2 rounded-full hover:bg-blue-50 transition-all group cursor-pointer"
            title="Edit Admin"
          >
            <IconEdit size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => handleDelete(admin.id)}
            className="p-2 rounded-full hover:bg-red-50 transition-all group cursor-pointer"
            title="Hapus Admin"
          >
            <IconTrash size={16} className="text-red-500 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];

  if (isError) {
    return <ErrorView onRetry={() => refetch()} />;
  }

  const stats = response?.data;
  const admins = response?.data?.admins || [];
  const pagination = response?.pagination;
  const tenants = tenantData?.locations.map(loc => ({
    id: loc.id.toString(),
    name: loc.name
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-gray-800">Manajemen Admin Semua Tenant</h3>
        <ButtonComponent
          label="Tambah Admin"
          onClick={handleOpenAddModal}
          isPrimary={true}
          isFullWidth={false}
          type="button"
          icon={<IconPlus size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          label="Total Admin"
          amount={stats?.totalAdmin || 0}
          isChange={false}
          icon={<IconUsers />}
          isLoading={isLoading}
          isError={isError}
        />
        <StatsCard
          label="Admin Aktif"
          amount={stats?.activeAdmin || 0}
          isChange={false}
          icon={<IconCheck />}
          isLoading={isLoading}
          isError={isError}
        />
        <StatsCard
          label="Admin Tidak Aktif"
          amount={stats?.inactiveAdmin || 0}
          isChange={false}
          icon={<IconX />}
          isLoading={isLoading}
          isError={isError}
        />
        <StatsCard
          label="Login Hari Ini"
          amount={stats?.loginToday || 0}
          isChange={false}
          icon={<IconLogin />}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <TableComponent
        columns={columns}
        data={admins}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="Belum ada data admin."
        keyExtractor={(item) => item.id}
        pagination={true}
        pageSize={pagination?.itemsPerPage || pageSize}
        currentPage={pagination?.currentPage || page}
        totalItems={pagination?.totalItems}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Admin Modal (Add/Edit) */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={editData}
        tenants={tenants}
      />

      <Toast
        toasts={toasts}
        onRemove={removeToast}
      />
    </div>
  );
};

export default ManagementAdminPage;

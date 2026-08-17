"use client";

import React, { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import TextInput from "./inputs/TextInput";
import TextBoxInput from "./inputs/TextBoxInput";
import DropdownInput from "./inputs/DropdownInput";
import ButtonComponent from "./buttons/ButtonComponent";
import { CreateServiceRequest } from "@/types/service";

export type ServiceFormData = {
  id?: number;
  name: string;
  description: string;
  price: string;
  vehicleType: string;
  minCc: string;
  maxCc: string;
};

type ServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServiceRequest) => Promise<void> | void;
  isLoading?: boolean;
  mode?: "add" | "edit";
  initialData?: ServiceFormData;
};

const emptyFormData: ServiceFormData = {
  name: "",
  description: "",
  price: "",
  vehicleType: "MOBIL",
  minCc: "",
  maxCc: "",
};

const vehicleTypeOptions = [
  { id: "MOBIL", name: "Mobil" },
  { id: "MOTOR", name: "Motor" },
];

const ServiceModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  mode = "add",
  initialData,
}: ServiceModalProps) => {
  const [formData, setFormData] = useState<ServiceFormData>(emptyFormData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || emptyFormData);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditMode = mode === "edit";

  const handleClose = () => {
    setFormData(emptyFormData);
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ambil locationId dari localStorage admin login
    let locationId: number | null = null;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.locationId !== undefined && user?.locationId !== null) {
          locationId = Number(user.locationId);
        }
      }
      if (locationId === null) {
        const storedLocId = localStorage.getItem("locationId");
        if (storedLocId) {
          locationId = Number(storedLocId);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil locationId:", err);
    }

    const payload: CreateServiceRequest = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      vehicleType: formData.vehicleType.toUpperCase(),
      minCc: formData.minCc !== "" ? Number(formData.minCc) : null,
      maxCc: formData.maxCc !== "" ? Number(formData.maxCc) : null,
      locationId: locationId,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-screen">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Layanan" : "Tambah Layanan"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <IconX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            id="name"
            label="Nama Layanan"
            value={formData.name}
            onChange={handleChange}
            isRed={false}
            required={true}
          />

          <TextBoxInput
            id="description"
            label="Deskripsi"
            value={formData.description}
            onChange={handleChange}
            isRed={false}
            required={true}
          />

          <TextInput
            id="price"
            label="Harga (Rp)"
            value={formData.price}
            onChange={handleChange}
            isRed={false}
            required={true}
          />

          <DropdownInput
            id="vehicleType"
            label="Tipe Kendaraan"
            value={formData.vehicleType}
            onChange={handleChange}
            isRed={false}
            required={true}
            data={vehicleTypeOptions}
          />

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="minCc"
              label="Min CC (Opsional)"
              value={formData.minCc}
              onChange={handleChange}
              isRed={false}
              required={false}
            />

            <TextInput
              id="maxCc"
              label="Max CC (Opsional)"
              value={formData.maxCc}
              onChange={handleChange}
              isRed={false}
              required={false}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <div className="flex-1">
              <ButtonComponent
                label="Batal"
                onClick={handleClose}
                isPrimary={false}
                isFullWidth={true}
                type="button"
              />
            </div>
            <div className="flex-1">
              <ButtonComponent
                label={isLoading ? "Menyimpan..." : "Simpan"}
                isPrimary={true}
                isFullWidth={true}
                type="submit"
                disabled={isLoading}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;

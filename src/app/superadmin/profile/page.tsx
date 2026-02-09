"use client";

import { IconEdit } from '@tabler/icons-react'
import React, { useState, useEffect, useRef } from 'react'
import { authService } from '@/services/authService';
import { User } from '@/types/auth';
import Image from 'next/image';
import TextInput from '@/components/inputs/TextInput';
import ButtonComponent from '@/components/buttons/ButtonComponent';
import { useUpdateProfile } from '@/hooks/useAdmins';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

const SuperadminProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfileMutation = useUpdateProfile();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        username: storedUser.username || "",
        name: storedUser.name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || ""
      });
    }

    // Check for success flag after reload
    const successFlag = sessionStorage.getItem("profile_update_success");
    if (successFlag === "true") {
      showToast("Profil berhasil diperbarui", "success");
      sessionStorage.removeItem("profile_update_success");
    }
  }, [showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateProfileMutation.mutateAsync({
        ...formData,
        profilePhoto: selectedFile || undefined
      });

      // Update local storage user data
      if (result.data) {
        const storedUser = authService.getUser();
        const updatedUser = { ...storedUser, ...result.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update cookies for middleware sync
        document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }

      // Set flag and reload
      sessionStorage.setItem("profile_update_success", "true");
      window.location.reload();
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal memperbarui profil";
      showToast(message, "error");
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Update Profile</h3>

      <div className='shadow-sm w-full bg-white rounded-lg p-5'>

        <div className='w-full flex justify-center m-5'>
          <div className='relative w-24 h-24'>
            <Image
              src={previewUrl || user?.photoUrl || '/profile-placeholder.png'}
              alt="Profile"
              width={100}
              height={100}
              className="object-cover w-full h-full rounded-full"
              unoptimized={true}
              onError={(e) => {
                // Fallback to placeholder if backend image fails
                const target = e.target as HTMLImageElement;
                target.src = '/profile-placeholder.png';
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className='absolute bottom-0 right-0 w-8 h-8 rounded-full border border-blue-500 bg-blue-50 flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors'
            >
              <IconEdit size={20} className='text-blue-500' />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextInput
            id="username"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            isRed={false}
            required={true}
          />
          <TextInput
            id="name"
            label="Nama Lengkap"
            value={formData.name}
            onChange={handleChange}
            isRed={false}
            required={true}
          />
          <TextInput
            id="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            isRed={false}
            required={true}
          />
          <TextInput
            id="phone"
            label="Nomor HP"
            value={formData.phone}
            onChange={handleChange}
            isRed={false}
            required={true}
          />

          <div className='flex justify-end'>
            <ButtonComponent
              label={updateProfileMutation.isPending ? "Menyimpan..." : "Simpan"}
              isPrimary={true}
              isFullWidth={false}
              type="submit"
              disabled={updateProfileMutation.isPending}
            />
          </div>
        </form>
      </div>

      <Toast
        toasts={toasts}
        onRemove={removeToast}
      />
    </div>
  )
}

export default SuperadminProfilePage;

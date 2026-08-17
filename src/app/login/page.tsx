"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import ButtonComponent from "@/components/buttons/ButtonComponent";
import TextInput from "@/components/inputs/TextInput";
import PasswordInput from "@/components/inputs/PasswordInput";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });

      // Redirect berdasarkan role user
      const userRole = response.data.user.role;
      if (userRole === 'SUPERADMIN') {
        router.push("/superadmin/dashboard");
      } else if (userRole === 'ADMIN') {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      // Handle error dari API
      const errorMessage = err.response?.data?.message || "Login gagal. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/tel-u-logo-lettermark.png"
            alt="Telkom University"
            width={56}
            height={68}
            className="object-contain"
          />
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Selamat Datang
          </h1>
          <p className="text-gray-500 text-center">
            Silakan login menggunakan akun yang sudah terdaftar
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <TextInput id="username" label="Username" onChange={(e) => setUsername(e.target.value)} isRed={true} required={true} />

          {/* Password Field */}
          <PasswordInput id="password" onChange={(e) => setPassword(e.target.value)} isRed={true} required={true} />

          {/* Submit Button */}
          <ButtonComponent
            type="submit"
            label={isLoading ? "Memproses..." : "Masuk"}
            isPrimary={true}
            isRed={true}
            isFullWidth={true}
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getDate } from "@/utils/getDate";
import { IconUser, IconLogout, IconChevronDown, IconMenu2 } from "@tabler/icons-react";
import { useLogout } from "@/hooks/useLogout";
import { authService } from "@/services/authService";
import { User } from "@/types/auth";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, isLoggingOut } = useLogout();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Ambil data user dari localStorage saat component mount
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header/Navbar */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <IconMenu2 size={24} />
            </button>
            <h1 className="text-sm sm:text-base font-semibold">
              {getDate(new Date().toISOString())}
            </h1>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-lg cursor-pointer"
            >
              {/* Profile Photo */}
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                <Image
                  src={user?.photoUrl || '/profile-placeholder.png'}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  unoptimized={true}
                  onError={(e) => {
                    // Fallback to placeholder if backend image fails
                    const target = e.target as HTMLImageElement;
                    target.src = '/profile-placeholder.png';
                  }}
                />
              </div>

              {/* Name & Role */}
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user ? user.name : 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user ? user.role : 'Superadmin'}
                </p>
              </div>

              <IconChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <Link
                  href="/superadmin/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <IconUser size={16} />
                  Profil
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconLogout size={16} />
                  {isLoggingOut ? 'Keluar...' : 'Keluar'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area with scrolling */}
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;

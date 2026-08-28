"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  IconCategory2,
  IconHistory,
  IconSquarePlus,
  IconReceipt,
  IconStar,
  IconTools,
  IconX,
} from "@tabler/icons-react";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar = ({ isOpen = false, onClose }: AdminSidebarProps) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: IconCategory2,
    },
    {
      href: "/admin/transaksi",
      label: "Transaksi",
      icon: IconReceipt,
    },
    {
      href: "/admin/transaksi-manual",
      label: "Transaksi Manual",
      icon: IconSquarePlus,
    },
    {
      href: "/admin/riwayat-transaksi",
      label: "Riwayat Transaksi",
      icon: IconHistory,
    },
    {
      href: "/admin/manajemen-layanan",
      label: "Manajemen Layanan",
      icon: IconTools,
    },
    {
      href: "/admin/ulasan",
      label: "Daftar Ulasan",
      icon: IconStar,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 flex flex-col py-4 px-5 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl md:shadow-none" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <a href="/" className="flex items-center p-2 w-fit">
            <Image src="/tel-u-logo.png" alt="TelU Logo" width={20} height={20} />
            <span className="ml-2 font-semibold text-xl">Car Wash</span>
          </a>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 md:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <IconX size={20} />
          </button>
        </div>

        <nav className="flex-1">
          <ul>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href} className="mb-2">
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className={`flex items-center p-3 rounded-lg transition-colors duration-200 font-medium ${
                      isActive
                        ? "bg-cranberry-50 text-cranberry-500 border border-cranberry-500"
                        : "hover:bg-cranberry-50 hover:text-cranberry-500 text-gray-500"
                    }`}
                  >
                    <Icon className="mr-2" size={20} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;

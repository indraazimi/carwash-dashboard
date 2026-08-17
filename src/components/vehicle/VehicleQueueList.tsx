"use client";

import React from "react";
import VehicleStatusCard from "./VehicleStatusCard";

export type QueueItem = {
  bookingNumber: string | number;
  plate: string;
  type: string;
  queue_time: string;
  status: string;
};

type VehicleQueueListProps = {
  title?: string;
  queue?: QueueItem[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  className?: string;
};

const VehicleQueueList = ({
  title = "Antrian Kendaraan",
  queue = [],
  isLoading = false,
  isError = false,
  errorMessage = "Gagal memuat antrian",
  emptyMessage = "Tidak ada antrian",
  className = "",
}: VehicleQueueListProps) => {
  return (
    <div className={`w-full bg-white p-5 rounded-lg shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2 mt-6">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 bg-gray-50 rounded-lg animate-pulse h-16"
            />
          ))
        ) : isError ? (
          <div className="text-center text-gray-500 py-4">{errorMessage}</div>
        ) : queue.length > 0 ? (
          queue.map((item) => (
            <VehicleStatusCard
              key={item.bookingNumber}
              data={{
                plat: item.plate,
                kategori: item.type,
                jamBooking: item.queue_time,
                status: item.status,
              }}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
};

export default VehicleQueueList;

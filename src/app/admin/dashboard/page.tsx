"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/StatsCard";
import LineAreaChart from "@/components/charts/LineAreaChart";
import BarChart from "@/components/charts/BarChart";
import { IconCoin, IconCar, IconClockHour3 } from "@tabler/icons-react";
import VehicleStatusCard from "@/components/vehicle/VehicleStatusCard";
import { useAdminStats } from "@/hooks/useAdminStats";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";

const AdminDashboardPage = () => {
  const { data: stats, isLoading, refetch } = useAdminStats();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <DashboardSkeleton cards={3} />;
  if (!stats) return <div className="p-4 text-center">Data tidak tersedia</div>;

  // Transform weekly revenue for LineChart
  const transactionData = stats.weeklyRevenue.data.map((item) => ({
    name: item.day,
    value: item.revenue,
  }));

  // Transform washing stats for BarChart
  const pencucianData = stats.todayWashingStatistics.map((item) => ({
    name: item.time,
    value: item.value,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Stats Cards */}
      <StatsCard
        label="Pendapatan Hari Ini"
        amount={`Rp ${stats.todayRevenue.toLocaleString('id-ID')}`}
        change={0}
        isChange={false}
        icon={<IconCoin />}
      />
      <StatsCard
        label="Kendaraan Dicuci"
        amount={stats.totalWashedToday}
        change={0}
        isChange={false}
        icon={<IconCar />}
      />
      <StatsCard
        label="Antrian Aktif"
        amount={stats.activeQueue}
        isChange={false}
        icon={<IconClockHour3 />}
      />

      {/* Line Area Chart */}
      <div className="lg:col-span-3">
        <LineAreaChart
          data={transactionData}
          title={`Pendapatan Minggu Ini`}
          height={350}
        />
      </div>

      {/* Bar Chart */}
      <div className="lg:col-span-3 xl:col-span-2">
        <BarChart
          data={pencucianData}
          title="Pencucian Hari Ini"
        />
      </div>

      {/* Queue List */}
      <div className="w-full bg-white p-5 rounded-lg shadow-sm lg:col-span-3 xl:col-span-1">
        <h3 className="text-lg font-semibold">Antrian Kendaraan</h3>
        <div className="space-y-2 mt-6">
          {stats.todayQueue.length > 0 ? (
            stats.todayQueue.map((item) => (
              <VehicleStatusCard
                key={item.bookingNumber}
                data={{
                  plat: item.plate,
                  kategori: item.type,
                  jamBooking: item.queue_time,
                  status: item.status
                }}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">Tidak ada antrian</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;


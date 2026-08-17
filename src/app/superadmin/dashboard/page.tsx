"use client";

import { useEffect } from "react";
import StatsCard from "@/components/StatsCard";
import LineAreaChart from "@/components/charts/LineAreaChart";
import BarChart from "@/components/charts/BarChart";
import { IconBuildingStore, IconUsers } from "@tabler/icons-react";
import VehicleStatusCard from "@/components/vehicle/VehicleStatusCard";
import { useSuperadminStats } from "@/hooks/useSuperadminStats";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";

const SuperadminDashboardPage = () => {
  const { data: stats, isLoading, refetch } = useSuperadminStats();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <DashboardSkeleton />;
  if (!stats) return <div>Data tidak tersedia</div>;

  // Transform weekly revenue for LineChart
  const transactionData = stats.weeklyRevenue.data.map((item: any) => ({
    name: item.day,
    value: item.revenue
  }));

  // Transform washing stats for BarChart
  const pencucianData = stats.todayWashingStatistics.map((item: any) => ({
    name: item.time,
    value: item.value
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
      {/* Stats Cards */}
      <div className="lg:col-span-3">
        <StatsCard
          label="Total Tenant"
          amount={stats.totalTenant}
          change={0}
          isChange={false}
          icon={<IconBuildingStore />}
        />
      </div>
      <div className="lg:col-span-3">
        <StatsCard
          label="Total Admin"
          amount={stats.totalAdmin}
          change={0}
          isChange={false}
          icon={<IconUsers />}
        />
      </div>

      {/* Line Area Chart */}
      <div className="lg:col-span-6">
        <LineAreaChart
          data={transactionData}
          title={`Pendapatan Minggu Ini`}
          height={350}
        />
      </div>

      {/* Bar Chart */}
      <div className="lg:col-span-3 xl:col-span-4">
        <BarChart
          data={pencucianData}
          title="Pencucian Hari Ini"
        />
      </div>
      <div className="w-full bg-white p-5 rounded-lg shadow-sm lg:col-span-3 xl:col-span-2">
        <h3 className="text-lg font-semibold">Antrian Kendaraan</h3>
        <div className="space-y-2 mt-6">
          {stats.todayQueue.length > 0 ? stats.todayQueue.map((item: any) => (
            <VehicleStatusCard
              key={item.bookingNumber}
              data={{
                plat: item.plate,
                kategori: item.type,
                jamBooking: item.queue_time,
                status: item.status
              }}
            />
          )) : (
            <div className="text-center text-gray-500 py-4">Tidak ada antrian</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboardPage;

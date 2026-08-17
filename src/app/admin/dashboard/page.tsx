"use client";

import { useEffect } from "react";
import StatsCard from "@/components/StatsCard";
import LineAreaChart from "@/components/charts/LineAreaChart";
import BarChart from "@/components/charts/BarChart";
import { IconCoin, IconCar, IconClockHour3 } from "@tabler/icons-react";
import VehicleQueueList from "@/components/vehicle/VehicleQueueList";
import { useAdminStats } from "@/hooks/useAdminStats";

const AdminDashboardPage = () => {
  const { data: stats, isLoading, isError, refetch } = useAdminStats();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Transform weekly revenue for LineChart
  const transactionData = stats?.weeklyRevenue?.data?.map((item) => ({
    name: item.day,
    value: item.revenue,
  })) || [];

  // Transform washing stats for BarChart
  const pencucianData = stats?.todayWashingStatistics?.map((item) => ({
    name: item.time,
    value: item.value,
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Stats Cards */}
      <StatsCard
        label="Pendapatan Hari Ini"
        amount={stats ? `Rp ${stats.todayRevenue.toLocaleString('id-ID')}` : "-"}
        change={0}
        isChange={false}
        icon={<IconCoin />}
        isLoading={isLoading}
        isError={isError}
      />
      <StatsCard
        label="Kendaraan Dicuci"
        amount={stats ? stats.totalWashedToday : "-"}
        change={0}
        isChange={false}
        icon={<IconCar />}
        isLoading={isLoading}
        isError={isError}
      />
      <StatsCard
        label="Antrian Aktif"
        amount={stats ? stats.activeQueue : "-"}
        isChange={false}
        icon={<IconClockHour3 />}
        isLoading={isLoading}
        isError={isError}
      />

      {/* Line Area Chart */}
      <div className="lg:col-span-3">
        <LineAreaChart
          data={transactionData}
          title={`Pendapatan Minggu Ini`}
          height={350}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Bar Chart */}
      <div className="lg:col-span-3 xl:col-span-2">
        <BarChart
          data={pencucianData}
          title="Pencucian Hari Ini"
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Queue List */}
      <VehicleQueueList
        queue={stats?.todayQueue}
        isLoading={isLoading}
        isError={isError}
        className="lg:col-span-3 xl:col-span-1"
      />
    </div>
  );
};

export default AdminDashboardPage;

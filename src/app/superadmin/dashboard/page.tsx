"use client";

import { useEffect } from "react";
import StatsCard from "@/components/StatsCard";
import LineAreaChart from "@/components/charts/LineAreaChart";
import BarChart from "@/components/charts/BarChart";
import { IconBuildingStore, IconUsers } from "@tabler/icons-react";
import VehicleQueueList from "@/components/vehicle/VehicleQueueList";
import { useSuperadminStats } from "@/hooks/useSuperadminStats";

const SuperadminDashboardPage = () => {
  const { data: stats, isLoading, isError, refetch } = useSuperadminStats();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Transform weekly revenue for LineChart
  const transactionData = stats?.weeklyRevenue?.data?.map((item: any) => ({
    name: item.day,
    value: item.revenue
  })) || [];

  // Transform washing stats for BarChart
  const pencucianData = stats?.todayWashingStatistics?.map((item: any) => ({
    name: item.time,
    value: item.value
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
      {/* Stats Cards */}
      <div className="lg:col-span-3">
        <StatsCard
          label="Total Tenant"
          amount={stats ? stats.totalTenant : "-"}
          change={0}
          isChange={false}
          icon={<IconBuildingStore />}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
      <div className="lg:col-span-3">
        <StatsCard
          label="Total Admin"
          amount={stats ? stats.totalAdmin : "-"}
          change={0}
          isChange={false}
          icon={<IconUsers />}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Line Area Chart */}
      <div className="lg:col-span-6">
        <LineAreaChart
          data={transactionData}
          title={`Pendapatan Minggu Ini`}
          height={350}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Bar Chart */}
      <div className="lg:col-span-3 xl:col-span-4">
        <BarChart
          data={pencucianData}
          title="Pencucian Hari Ini"
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <VehicleQueueList
        queue={stats?.todayQueue}
        isLoading={isLoading}
        isError={isError}
        className="lg:col-span-3 xl:col-span-2"
      />
    </div>
  );
};

export default SuperadminDashboardPage;

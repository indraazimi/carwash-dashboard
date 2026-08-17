"use client";

import React from "react";

type StatsCardProps = {
  label: string;
  amount?: string | number;
  isChange?: boolean;
  change?: number;
  icon: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
};

const StatsCard = ({
  label,
  amount,
  isChange = false,
  change,
  icon,
  isLoading = false,
  isError = false,
  errorMessage = "Gagal memuat",
}: StatsCardProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between space-x-4 w-full animate-pulse">
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-7 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between space-x-4 w-full">
        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-semibold">{label}</p>
          <span className="text-sm font-medium text-gray-500">
            {errorMessage}
          </span>
        </div>
        {icon}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between space-x-4 w-full">
      <div className="flex flex-col gap-2">
        <p className="text-gray-500 text-sm font-semibold">{label}</p>
        <span className="text-xl font-bold">{amount}</span>
        {isChange &&
          typeof change === "number" &&
          (change > 0 ? (
            <span className="text-green-600">+{change}% dari kemarin</span>
          ) : change === 0 ? (
            <span className="text-gray-500">{change}% dari kemarin</span>
          ) : (
            <span className="text-red-600">{change}% dari kemarin</span>
          ))}
      </div>
      {icon}
    </div>
  );
};

export default StatsCard;

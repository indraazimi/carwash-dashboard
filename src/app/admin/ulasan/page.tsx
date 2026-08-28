"use client";

import { useState } from "react";
import { IconStarFilled, IconStar, IconMessageDots, IconUsers } from "@tabler/icons-react";
import TableComponent, { TableColumn } from "@/components/admin/table/TableComponent";
import StatsCard from "@/components/StatsCard";
import { useReviews } from "@/hooks/useReviews";
import { Review } from "@/types/review";
import { formatOnlyDate, formatTimeDot } from "@/utils/getDate";

const UlasanPage = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: response, isLoading, isError } = useReviews(undefined, page, pageSize);

  const reviews = response?.data?.reviews || [];
  const summary = response?.data?.summary;
  const pagination = response?.pagination;

  const columns: TableColumn<Review>[] = [
    {
      header: "CUSTOMER",
      className: "w-52",
      render: (review) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{review.user?.name || "-"}</span>
          {/* <span className="text-gray-500 text-sm">@{review.user?.username || "-"}</span> */}
        </div>
      ),
    },
    {
      header: "LAYANAN",
      className: "w-48",
      render: (review) => (
        <span className="font-medium text-gray-800">{review.service?.name || "-"}</span>
      ),
    },
    {
      header: "RATING",
      className: "w-36 text-center",
      sortable: true,
      sortKey: "rating",
      render: (review) => (
        <div className="flex items-center justify-center gap-1">
          <div className="flex items-center text-amber-400">
            {Array.from({ length: 5 }, (_, i) => (
              <IconStarFilled
                key={i}
                size={16}
                className={i < review.rating ? "text-amber-400" : "text-gray-200"}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-700 ml-1">({review.rating})</span>
        </div>
      ),
    },
    {
      header: "KOMENTAR",
      className: "flex-1",
      render: (review) => (
        <p className="text-gray-700 text-sm whitespace-pre-wrap">{review.comment || "-"}</p>
      ),
    },
    {
      header: "TANGGAL",
      className: "w-40 text-center",
      sortable: true,
      sortKey: "createdAt",
      render: (review) => (
        <div className="flex flex-col items-center">
          <span className="font-medium text-gray-900">{formatOnlyDate(review.createdAt)}</span>
          {/* <span className="text-gray-500 text-xs">{formatTimeDot(review.createdAt)}</span> */}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-gray-900">Daftar Ulasan Pelanggan</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          label="Total Ulasan"
          amount={summary?.totalReviews || pagination?.totalItems || reviews.length}
          isChange={false}
          icon={<IconMessageDots />}
          isLoading={isLoading}
          isError={isError}
        />
        <StatsCard
          label="Rata-Rata Rating"
          amount={summary?.averageRating ? Number(summary.averageRating.toFixed(1)) : 0}
          isChange={false}
          icon={<IconStar className="" />}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Reviews Table */}
      <TableComponent
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        isError={isError}
        searchable={true}
        searchPlaceholder="Cari ulasan"
        minWidth="min-w-[1000px]"
        emptyMessage="Belum ada ulasan untuk lokasi ini"
        keyExtractor={(item) => item.id}
        pagination={true}
        pageSize={pagination?.itemsPerPage || pageSize}
        currentPage={pagination?.currentPage || page}
        totalItems={pagination?.totalItems}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default UlasanPage;
"use client";

import { useState } from "react";
import { IconStarFilled } from "@tabler/icons-react";
import TableComponent, { TableColumn } from "@/components/admin/table/TableComponent";
import { useReviews } from "@/hooks/useReviews";
import { Review } from "@/types/review";
import { formatOnlyDate } from "@/utils/getDate";

const UlasanPage = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: response, isLoading, isError } = useReviews(undefined, page, pageSize);

  const reviews = response?.data?.reviews || [];
  const summary = response?.data?.summary;
  const pagination = response?.pagination;

  const totalReviews = summary?.totalReviews ?? pagination?.totalItems ?? reviews.length;
  const averageRating = summary?.averageRating ? summary.averageRating.toFixed(1) : "0.0";
  const distribution = summary?.distribution || {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };

  const formatReviewCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const columns: TableColumn<Review>[] = [
    {
      header: "CUSTOMER",
      className: "w-52",
      render: (review) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{review.user?.name || "-"}</span>
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-gray-900">Daftar Ulasan Pelanggan</h3>
      </div>

      {/* Rating Breakdown Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md">
        {isLoading ? (
          <div className="flex items-center gap-8 animate-pulse">
            <div className="space-y-2">
              <div className="h-12 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-2.5 bg-gray-200 rounded-full w-full"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            {/* Left Rating Overview */}
            <div className="flex flex-col items-start gap-1">
              <span className="text-6xl tracking-tight">
                {averageRating}
              </span>
              <div className="flex items-center gap-0.5 my-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const avg = Number(averageRating);
                  const isFilled = avg >= star;
                  return (
                    <IconStarFilled
                      key={star}
                      size={14}
                      className={isFilled ? "text-amber-400" : "text-gray-200"}
                    />
                  );
                })}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {formatReviewCount(totalReviews)} ulasan
              </span>
            </div>

            {/* Right Breakdown Bars */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star.toString()] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <div
                    key={star}
                    className="group relative flex items-center gap-2.5 text-xs py-0.5 cursor-pointer"
                  >
                    <span className="text-gray-700 font-medium w-2 text-right">{star}</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${count > 0 ? Math.max(percentage, 2) : 0}%` }}
                      />
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20">
                      {count} ulasan ({percentage.toFixed(0)}%)
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
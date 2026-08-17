"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  name: string;
  value: number;
};

type LineAreaChartProps = {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  formatValue?: (value: number) => string;
};

// Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
  label,
  formatValue,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">
          {formatValue ? formatValue(value) : value.toLocaleString("id-ID")}
        </p>
      </div>
    );
  }
  return null;
};

const LineAreaChart = ({
  data,
  title,
  subtitle,
  color = "#51a2ff",
  height = 300,
  showGrid = true,
  formatValue,
  isLoading = false,
  isError = false,
  errorMessage = "Gagal memuat data, silahkan muat ulang halaman",
}: LineAreaChartProps) => {
  // Generate gradient ID based on color to avoid conflicts
  const gradientId = `colorGradient-${color.replace("#", "")}`;

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 w-full">
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div
          style={{ height }}
          className="w-full bg-gray-50 rounded-lg animate-pulse flex items-end justify-between p-6 gap-3"
        >
          <div className="w-full bg-gray-200 rounded-t h-[40%]"></div>
          <div className="w-full bg-gray-200 rounded-t h-[65%]"></div>
          <div className="w-full bg-gray-200 rounded-t h-[50%]"></div>
          <div className="w-full bg-gray-200 rounded-t h-[85%]"></div>
          <div className="w-full bg-gray-200 rounded-t h-[70%]"></div>
          <div className="w-full bg-gray-200 rounded-t h-[95%]"></div>
          <div className="w-full bg-gray-200 rounded-t h-[60%]"></div>
        </div>
      ) : isError ? (
        /* Error State */
        <div
          style={{ height }}
          className="w-full flex items-center justify-center text-gray-500 text-sm font-medium p-4 text-center"
        >
          {errorMessage}
        </div>
      ) : (
        /* Chart */
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              dx={-10}
              tickFormatter={(value) =>
                formatValue ? formatValue(value) : value.toLocaleString("id-ID")
              }
            />

            <Tooltip
              content={<CustomTooltip formatValue={formatValue} />}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "5 5" }}
            />

            <Area
              type="linear"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{
                r: 6,
                fill: color,
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LineAreaChart;

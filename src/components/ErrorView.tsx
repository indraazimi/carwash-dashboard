"use client";

import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import ButtonComponent from "./buttons/ButtonComponent";

interface ErrorViewProps {
    message?: string;
    onRetry?: () => void;
}

const ErrorView = ({
    message = "Terjadi kesalahan saat memuat data.",
    onRetry
}: ErrorViewProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border border-red-50 shadow-sm">
            <div className="p-4 bg-red-50 rounded-full mb-4">
                <IconAlertTriangle size={48} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Ada Masalah</h3>
            <p className="text-gray-500 text-center mb-8 max-w-sm">
                {message}
            </p>
            {onRetry && (
                <ButtonComponent
                    label="Coba Lagi"
                    onClick={onRetry}
                    isPrimary={true}
                    isFullWidth={false}
                    type="button"
                    icon={<IconRefresh size={20} />}
                />
            )}
        </div>
    );
};

export default ErrorView;

import React from 'react';

export type SlotStatus = 'tersedia' | 'tidak tersedia' | string;

export interface PickSlotButtonProps {
    time: string;
    status: SlotStatus;
    isSelected?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

const PickSlotButton: React.FC<PickSlotButtonProps> = ({
    time,
    status,
    isSelected = false,
    onClick,
    disabled,
    className = ''
}) => {
    const isAvailable = typeof status === 'string'
        ? status.toLowerCase() === 'tersedia'
        : Boolean(status);

    const isDisabled = disabled !== undefined ? disabled : !isAvailable;

    const getStatusLabel = () => {
        if (typeof status === 'string') {
            return status.charAt(0).toUpperCase() + status.slice(1);
        }
        return isAvailable ? 'Tersedia' : 'Tidak Tersedia';
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all text-center ${isDisabled
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-500 cursor-pointer'
                        : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200 cursor-pointer'
                } ${className}`}
        >
            <p className="font-semibold text-sm">{time}</p>
            <p className={`text-xs ${isDisabled
                    ? ''
                    : isSelected
                        ? 'text-blue-500'
                        : isAvailable
                            ? 'text-blue-500'
                            : 'text-gray-500'
                }`}>
                {getStatusLabel()}
            </p>
        </button>
    );
};

export default PickSlotButton;

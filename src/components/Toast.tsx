"use client";

import { useEffect, useState } from "react";
import { IconAlertCircle, IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";

export type ToastType = "success" | "error" | "info";

interface ToastItemProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export const ToastItem = ({ message, type, onClose, duration = 5000 }: ToastItemProps) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const styles = {
        success: "bg-emerald-500 text-white",
        error: "bg-red-500 text-white",
        info: "bg-blue-500 text-white",
    };

    const icons = {
        success: <IconCheck className="w-5 h-5 text-white" />,
        error: <IconAlertCircle className="w-5 h-5 text-white" />,
        info: <IconInfoCircle className="w-5 h-5 text-white" />,
    };

    return (
        <div className={`animate-in ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}>
            <div className={`flex items-center gap-3 p-4 rounded-xl max-w-md shadow-lg ${styles[type]}`}>
                <div className="shrink-0">
                    {icons[type]}
                </div>
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={handleClose}
                    className="shrink-0 ml-auto p-1 rounded-full transition-transform hover:scale-110 cursor-pointer"
                >
                    <IconX className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: { id: string; message: string; type: ToastType }[];
    onRemove: (id: string) => void;
}

const Toast = ({ toasts, onRemove }: ToastContainerProps) => {
    return (
        <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-3 items-end">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

export default Toast;

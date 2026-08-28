import React from 'react'

type ButtonProps = {
    className?: string,
    onClick?: () => void,
    label: string,
    icon?: React.ReactNode,
    isPrimary: boolean,
    isRed?: boolean,
    isFullWidth?: boolean,
    type?: 'button' | 'submit' | 'reset',
    disabled?: boolean
}

const ButtonComponent = ({ className, onClick, label, icon, isPrimary, isRed, isFullWidth, type = 'button', disabled }: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={`${className} flex items-center gap-2 justify-center ${isFullWidth ? 'w-full' : 'w-fit'} whitespace-nowrap font-medium py-2 px-3 rounded-lg transition-colors duration-200 cursor-pointer ${isPrimary ? (isRed ? 'text-white bg-cranberry-500 hover:bg-cranberry-600' : 'text-white bg-blue-500 hover:bg-blue-600') : 'text-black bg-white hover:bg-gray-100 border-gray-200 border'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
            <span>{label}</span>
        </button>
    )
}

export default ButtonComponent
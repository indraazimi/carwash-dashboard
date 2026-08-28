import React from 'react'

type TextInputProps = {
    id: string,
    label: string,
    value?: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    isRed: boolean,
    required: boolean,
    disabled?: boolean,
    type?: string,
    inputMode?: "text" | "numeric" | "decimal" | "tel" | "search" | "email" | "url",
    pattern?: string,
    placeholder?: string,
}

const TextInput = ({ id, label, value, onChange, isRed, required, disabled, type = "text", inputMode, pattern, placeholder }: TextInputProps) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-gray-900 mb-2"
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type={type}
                inputMode={inputMode}
                pattern={pattern}
                id={id}
                value={value}
                onChange={onChange}
                name={id}
                placeholder={placeholder ?? `Masukkan ${label}`}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${isRed ? 'focus:ring-cranberry-300' : 'focus:ring-blue-300'} focus:border-transparent transition-all placeholder:text-gray-400 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required={required}
                disabled={disabled}
            />
        </div>
    )
}

export default TextInput
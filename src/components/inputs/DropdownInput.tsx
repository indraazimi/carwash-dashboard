import React from 'react'

type DropdownInputProps = {
    id: string,
    label: string,
    value?: string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    isRed: boolean,
    required: boolean,
    data: any[],
    disabled?: boolean
}

const DropdownInput = ({ id, label, value, onChange, isRed, required, data, disabled }: DropdownInputProps) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-gray-900 mb-2"
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${isRed ? 'focus:ring-cranberry-300' : 'focus:ring-blue-300'} focus:border-transparent transition-all ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                required={required}
                disabled={disabled}
            >
                <option value="">Pilih {label}</option>
                {data.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default DropdownInput
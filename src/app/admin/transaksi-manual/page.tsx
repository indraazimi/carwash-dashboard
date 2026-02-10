"use client";
import React, { useState, useMemo, useEffect } from 'react'
import { transactionService } from '@/services/transactionService'
import TextInput from '@/components/inputs/TextInput'
import DropdownInput from '@/components/inputs/DropdownInput'
import ButtonComponent from '@/components/buttons/ButtonComponent'
import { useServices } from '@/hooks/useServices'
import TableSkeleton from '@/components/skeleton/TableSkeleton'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/Toast'

const TransaksiManualPage = () => {
    const { toasts, showToast, removeToast } = useToast();
    const createTransactionMutation = useCreateTransaction();
    // Base services for the sidebar list
    const { data: allServices, isLoading: isLoadingAll } = useServices()
    const [formData, setFormData] = useState({
        namaCustomer: "",
        noHp: "",
        platNomor: "",
        jenisKendaraan: "",
        jenisLayanan: ""
    })
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [isUserFound, setIsUserFound] = useState(false)
    const [isVehicleFromRecommendation, setIsVehicleFromRecommendation] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            if (formData.noHp.length >= 10) {
                try {
                    const res = await transactionService.getUserByPhone(formData.noHp)
                    if (res.status === "success") {
                        setFormData(prev => ({
                            ...prev,
                            namaCustomer: res.data.name
                        }))
                        setRecommendations(res.data.vehicles)
                        setIsUserFound(true)
                    } else {
                        setIsUserFound(false)
                        setRecommendations([])
                    }
                } catch (error) {
                    setIsUserFound(false)
                    setRecommendations([])
                }
            } else {
                setIsUserFound(false)
                setRecommendations([])
            }
            setIsVehicleFromRecommendation(false)
        }

        const timer = setTimeout(() => {
            fetchUser()
        }, 500)

        return () => clearTimeout(timer)
    }, [formData.noHp])

    // Filtered services specifically for the dropdown based on selected vehicle type
    const { data: filteredServices } = useServices(
        formData.jenisKendaraan.toUpperCase(),
        formData.jenisKendaraan !== ""
    )

    const dataLayanan = allServices || []

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset service selection if vehicle type changes
            ...(name === 'jenisKendaraan' ? { jenisLayanan: "" } : {})
        }))
        if (name === 'platNomor' || name === 'jenisKendaraan') {
            setIsVehicleFromRecommendation(false)
        }
    }

    const selectedLayanan = useMemo(() => {
        return dataLayanan.find(l => l.id.toString() === formData.jenisLayanan)
    }, [formData.jenisLayanan])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const payload = {
                name: formData.namaCustomer,
                phone: formData.noHp,
                plate: formData.platNomor,
                vehicleType: formData.jenisKendaraan.toUpperCase(),
                serviceId: Number(formData.jenisLayanan)
            };

            const res = await createTransactionMutation.mutateAsync(payload);
            showToast(res.message || "Transaksi berhasil dibuat", "success");

            // Reset form
            setFormData({
                namaCustomer: "",
                noHp: "",
                platNomor: "",
                jenisKendaraan: "",
                jenisLayanan: ""
            });
            setIsUserFound(false);
            setRecommendations([]);
            setIsVehicleFromRecommendation(false);
        } catch (error: any) {
            console.error("Submit error:", error);
            showToast(error.response?.data?.message || "Gagal membuat transaksi", "error");
        }
    }

    const dataJenisKendaraan = [
        { id: "mobil", name: "Mobil" },
        { id: "motor", name: "Motor" }
    ]

    const dataLayananFormatted = formData.jenisKendaraan
        ? (filteredServices || []).map((l: any) => ({
            id: l.id,
            name: `${l.name}`
            // name: `${l.name} - ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(l.price)}`
        }))
        : []

    if (isLoadingAll) return <TableSkeleton />

    return (
        <div className='space-y-6'>
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Transaksi Manual</h3>
            </div>
            <div className='flex gap-4'>
                <div className='bg-white p-5 flex-1 rounded-lg shadow-sm'>
                    <h3 className='font-semibold text-lg'>Informasi Transaksi</h3>
                    <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
                        <TextInput
                            id="noHp"
                            label="Nomor Handphone"
                            value={formData.noHp}
                            onChange={handleChange}
                            isRed={false}
                            required={true}
                        />
                        <TextInput
                            id="namaCustomer"
                            label="Nama Customer"
                            value={formData.namaCustomer}
                            onChange={handleChange}
                            isRed={false}
                            required={true}
                            disabled={isUserFound}
                        />
                        <div className="space-y-2">
                            <TextInput
                                id="platNomor"
                                label="Plat Nomor"
                                value={formData.platNomor}
                                onChange={handleChange}
                                isRed={false}
                                required={true}
                            />
                            {recommendations.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {recommendations.map((v) => (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    platNomor: v.plate,
                                                    jenisKendaraan: v.type.toLowerCase(),
                                                    jenisLayanan: ""
                                                }))
                                                setIsVehicleFromRecommendation(true)
                                            }}
                                            className="text-sm font-medium text-gray-500 px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            {v.plate} ({v.model})
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <DropdownInput
                            id="jenisKendaraan"
                            label="Jenis Kendaraan"
                            value={formData.jenisKendaraan}
                            onChange={handleChange}
                            isRed={false}
                            required={true}
                            data={dataJenisKendaraan}
                            disabled={isVehicleFromRecommendation}
                        />
                        <DropdownInput
                            id="jenisLayanan"
                            label="Jenis Layanan"
                            value={formData.jenisLayanan}
                            onChange={handleChange}
                            isRed={false}
                            required={true}
                            data={dataLayananFormatted}
                        />
                        <hr className='text-gray-200' />
                        <div className='flex justify-between items-center'>
                            <h3 className="font-medium">Total Harga</h3>
                            <h3 className="font-medium text-blue-500">
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(selectedLayanan?.price || 0)}
                            </h3>
                        </div>
                        <ButtonComponent
                            label={createTransactionMutation.isPending ? "Memproses..." : "Buat Transaksi"}
                            isPrimary={true}
                            isFullWidth={true}
                            type="submit"
                            disabled={createTransactionMutation.isPending}
                        />
                    </form>
                </div>
                <div className='bg-white p-5 flex-1 rounded-lg shadow-sm'>
                    <h3 className='font-semibold text-lg mb-6'>Daftar Harga Layanan</h3>
                    <div className='space-y-3'>
                        {dataLayanan.map((l) => (
                            <div key={l.id} className='w-full p-4 border border-gray-300 rounded-lg space-y-1'>
                                <h3 className='font-medium text-gray-900'>{l.name}</h3>
                                <p className='text-blue-500 font-semibold'>
                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(l.price)}
                                </p>
                            </div>
                        ))}
                        {dataLayanan.length === 0 && (
                            <div className='text-center py-10 text-gray-500'>Tidak ada layanan tersedia</div>
                        )}
                    </div>
                </div>
            </div>
            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    )
}

export default TransaksiManualPage
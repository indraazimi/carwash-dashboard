"use client";
import React, { useState, useMemo, useEffect } from 'react'
import { transactionService } from '@/services/transactionService'
import TextInput from '@/components/inputs/TextInput'
import DropdownInput from '@/components/inputs/DropdownInput'
import ButtonComponent from '@/components/buttons/ButtonComponent'
import PickSlotButton from '@/components/buttons/PickSlotButton'
import { useServices } from '@/hooks/useServices'
import { useSlotAvailability } from '@/hooks/useSlots'
import { formatTimeDot } from '@/utils/getDate'
import TableSkeleton from '@/components/skeleton/TableSkeleton'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/Toast'

const formatCcRange = (minCc?: number | null, maxCc?: number | null): string | null => {
    if (minCc === 0 && maxCc && maxCc > 0) {
        return `<=${maxCc} CC`;
    }
    if (minCc && minCc > 0 && (maxCc === null || maxCc === undefined)) {
        return `>=${minCc} CC`;
    }
    if (minCc && minCc > 0 && maxCc && maxCc > 0) {
        return `${minCc} CC - ${maxCc} CC`;
    }
    if (minCc && !maxCc) {
        return `>=${minCc} CC`;
    }
    if ((minCc === 0 || minCc === null || minCc === undefined) && maxCc) {
        return `<=${maxCc} CC`;
    }
    return null;
};

const TransaksiManualPage = () => {
    const { toasts, showToast, removeToast } = useToast();
    const createTransactionMutation = useCreateTransaction();
    // Base services for the sidebar list
    const { data: allServices, isLoading: isLoadingAll } = useServices()
    const { data: slotData, isLoading: isLoadingSlots } = useSlotAvailability()
    const [selectedSlotTime, setSelectedSlotTime] = useState<string>("")
    const [formData, setFormData] = useState({
        namaCustomer: "",
        noHp: "",
        platNomor: "",
        jenisKendaraan: "",
        cc: "",
        jenisLayanan: ""
    })
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [isUserFound, setIsUserFound] = useState(false)
    const [isVehicleFromRecommendation, setIsVehicleFromRecommendation] = useState(false)

    const groupedSlots = useMemo(() => {
        if (!slotData || !Array.isArray(slotData)) return [];

        const groupMap = new Map<string, typeof slotData>();

        slotData.forEach((item) => {
            const existing = groupMap.get(item.time) || [];
            existing.push(item);
            groupMap.set(item.time, existing);
        });

        return Array.from(groupMap.entries()).map(([time, items]) => {
            const hasAvailable = items.some(
                (slot) => slot.status?.toUpperCase() === 'AVAILABLE'
            );
            return {
                rawTime: time,
                timeLabel: formatTimeDot(time),
                status: (hasAvailable ? 'tersedia' : 'tidak tersedia') as 'tersedia' | 'tidak tersedia',
                availableCount: items.filter(s => s.status?.toUpperCase() === 'AVAILABLE').length,
                totalCount: items.length
            };
        });
    }, [slotData]);

    useEffect(() => {
        const fetchUser = async () => {
            if (formData.noHp.length >= 10) {
                try {
                    const res = await transactionService.getUserByPhone(formData.noHp)
                    if (res.status === "success") {
                        const vehicles = res.data.vehicles || [];
                        setRecommendations(vehicles);
                        setIsUserFound(true);

                        setFormData(prev => {
                            const normalizedPlate = prev.platNomor.replace(/\s+/g, '').toUpperCase();
                            const matched = vehicles.find((v: any) => v.plate && v.plate.replace(/\s+/g, '').toUpperCase() === normalizedPlate);
                            if (matched && normalizedPlate.length > 0) {
                                setIsVehicleFromRecommendation(true);
                                return {
                                    ...prev,
                                    namaCustomer: res.data.name,
                                    jenisKendaraan: matched.type.toLowerCase(),
                                    cc: matched.cc ? matched.cc.toString() : (matched.engineCapacity ? matched.engineCapacity.toString() : prev.cc),
                                    jenisLayanan: ""
                                };
                            }
                            return {
                                ...prev,
                                namaCustomer: res.data.name
                            };
                        });
                    } else {
                        setIsUserFound(false)
                        setRecommendations([])
                        setIsVehicleFromRecommendation(false)
                    }
                } catch (error) {
                    setIsUserFound(false)
                    setRecommendations([])
                    setIsVehicleFromRecommendation(false)
                }
            } else {
                setIsUserFound(false)
                setRecommendations([])
                setIsVehicleFromRecommendation(false)
            }
        }

        const timer = setTimeout(() => {
            fetchUser()
        }, 500)

        return () => clearTimeout(timer)
    }, [formData.noHp])

    // Filtered services specifically for the dropdown based on selected vehicle type and CC
    const { data: filteredServices } = useServices(
        formData.jenisKendaraan ? formData.jenisKendaraan.toUpperCase() : undefined,
        Boolean(formData.jenisKendaraan && formData.cc),
        undefined,
        formData.cc || undefined
    )

    const dataLayanan = allServices || []

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'platNomor') {
            const normalizedInput = value.replace(/\s+/g, '').toUpperCase();
            const matchedVehicle = recommendations.find(
                (v: any) => v.plate && v.plate.replace(/\s+/g, '').toUpperCase() === normalizedInput
            );

            if (matchedVehicle && normalizedInput.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    platNomor: value,
                    jenisKendaraan: matchedVehicle.type.toLowerCase(),
                    cc: matchedVehicle.cc ? matchedVehicle.cc.toString() : (matchedVehicle.engineCapacity ? matchedVehicle.engineCapacity.toString() : ""),
                    jenisLayanan: ""
                }));
                setIsVehicleFromRecommendation(true);
                return;
            } else {
                setIsVehicleFromRecommendation(false);
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset service selection if vehicle type or CC changes
            ...(name === 'jenisKendaraan' || name === 'cc' ? { jenisLayanan: "" } : {})
        }))
        if (name === 'jenisKendaraan' || name === 'cc') {
            setIsVehicleFromRecommendation(false)
        }
    }

    const selectedLayanan = useMemo(() => {
        return dataLayanan.find(l => l.id.toString() === formData.jenisLayanan)
    }, [formData.jenisLayanan])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedSlotTime) {
            showToast("Silakan pilih slot jam terlebih dahulu", "error");
            return;
        }

        try {
            const payload = {
                name: formData.namaCustomer,
                phone: formData.noHp,
                plate: formData.platNomor,
                vehicleType: formData.jenisKendaraan.toUpperCase(),
                serviceId: Number(formData.jenisLayanan),
                bookingTime: selectedSlotTime
            };

            const res = await createTransactionMutation.mutateAsync(payload);
            showToast(res.message || "Transaksi berhasil dibuat", "success");

            // Reset form
            setFormData({
                namaCustomer: "",
                noHp: "",
                platNomor: "",
                jenisKendaraan: "",
                cc: "",
                jenisLayanan: ""
            });
            setSelectedSlotTime("");
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

    const dataLayananFormatted = (formData.jenisKendaraan && formData.cc)
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
                                required
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
                                                    cc: v.cc ? v.cc.toString() : (v.engineCapacity ? v.engineCapacity.toString() : (v.capacity ? v.capacity.toString() : prev.cc)),
                                                    jenisLayanan: ""
                                                }))
                                                setIsVehicleFromRecommendation(true)
                                            }}
                                            className="text-sm font-medium text-gray-500 px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            {v.plate} ({v.model}{v.cc ? ` - ${v.cc} CC` : ''})
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
                            required
                            data={dataJenisKendaraan}
                            disabled={isVehicleFromRecommendation}
                        />
                        <TextInput
                            id="cc"
                            label="CC Kendaraan"
                            value={formData.cc}
                            onChange={handleChange}
                            isRed={false}
                            required
                            disabled={isVehicleFromRecommendation}
                        />
                        <DropdownInput
                            id="jenisLayanan"
                            label="Jenis Layanan"
                            value={formData.jenisLayanan}
                            onChange={handleChange}
                            isRed={false}
                            required
                            data={dataLayananFormatted}
                            disabled={!formData.jenisKendaraan || !formData.cc}
                        />
                        <hr className='text-gray-200' />
                        <div className='space-y-2'>
                            <h3 className='font-medium'>Pilih Slot Jam</h3>
                            <div className='grid grid-cols-5 gap-2 max-h-40 overflow-y-auto'>
                                {isLoadingSlots ? (
                                    <div className="col-span-4 text-center py-4 text-gray-500 text-sm">
                                        Memuat data slot...
                                    </div>
                                ) : groupedSlots.length > 0 ? (
                                    groupedSlots.map((slot) => (
                                        <PickSlotButton
                                            key={slot.rawTime}
                                            time={slot.timeLabel}
                                            status={slot.status}
                                            isSelected={selectedSlotTime === slot.rawTime}
                                            onClick={() => {
                                                if (slot.status === 'tersedia') {
                                                    setSelectedSlotTime(slot.rawTime);
                                                }
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-4 text-center py-4 text-gray-500 text-sm">
                                        Tidak ada slot tersedia
                                    </div>
                                )}
                            </div>
                        </div>
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
                        {dataLayanan.map((l) => {
                            const ccText = formatCcRange(l.minCc, l.maxCc);

                            return (
                                <div key={l.id} className='w-full p-4 border border-gray-300 rounded-lg space-y-1'>
                                    <h3 className='font-medium text-gray-900'>{l.name}</h3>
                                    {ccText && <p className='text-xs text-gray-500'>{ccText}</p>}
                                    <p className='text-blue-500 font-semibold'>
                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(l.price)}
                                    </p>
                                </div>
                            );
                        })}
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
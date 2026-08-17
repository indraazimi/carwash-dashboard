import apiClient from '@/api/apiClient';
import { ServiceResponse } from '@/types/service';

export const serviceService = {
    getServices: async (type?: string, locationId?: number | string, cc?: number | string): Promise<ServiceResponse> => {
        let locId = locationId;

        if (locId === undefined && typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user?.locationId !== undefined && user?.locationId !== null) {
                        locId = user.locationId;
                    }
                }

                if (locId === undefined) {
                    const storedLocId = localStorage.getItem('locationId');
                    if (storedLocId) {
                        locId = storedLocId;
                    }
                }
            } catch (error) {
                console.error('Gagal mengambil locationId dari localStorage:', error);
            }
        }

        const params: Record<string, any> = {};
        if (type) params.type = type;
        if (locId !== undefined && locId !== null) params.locationId = locId;
        if (cc !== undefined && cc !== null && cc !== '') params.cc = cc;

        const response = await apiClient.get<ServiceResponse>('/services', {
            params
        });
        return response.data;
    },

    createService: async (payload: import('@/types/service').CreateServiceRequest): Promise<{ status: string; message: string; data: import('@/types/service').Service }> => {
        let locId = payload.locationId;
        if (locId === undefined && typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user?.locationId !== undefined && user?.locationId !== null) {
                        locId = user.locationId;
                    }
                }
                if (locId === undefined) {
                    const storedLocId = localStorage.getItem('locationId');
                    if (storedLocId) {
                        locId = Number(storedLocId);
                    }
                }
            } catch (error) {
                console.error('Gagal mengambil locationId dari localStorage:', error);
            }
        }

        const dataToSend = {
            ...payload,
            locationId: locId !== undefined && locId !== null ? Number(locId) : undefined
        };

        const response = await apiClient.post<{ status: string; message: string; data: import('@/types/service').Service }>('/services', dataToSend);
        return response.data;
    },

    updateService: async (id: number, payload: Partial<import('@/types/service').CreateServiceRequest>): Promise<{ status: string; message: string; data: import('@/types/service').Service }> => {
        let locId = payload.locationId;
        if (locId === undefined && typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user?.locationId !== undefined && user?.locationId !== null) {
                        locId = user.locationId;
                    }
                }
                if (locId === undefined) {
                    const storedLocId = localStorage.getItem('locationId');
                    if (storedLocId) {
                        locId = Number(storedLocId);
                    }
                }
            } catch (error) {
                console.error('Gagal mengambil locationId dari localStorage:', error);
            }
        }

        const dataToSend = {
            ...payload,
            locationId: locId !== undefined && locId !== null ? Number(locId) : undefined
        };

        const response = await apiClient.put<{ status: string; message: string; data: import('@/types/service').Service }>(`/services/${id}`, dataToSend);
        return response.data;
    },

    deleteService: async (id: number): Promise<{ status: string; message: string }> => {
        const response = await apiClient.delete<{ status: string; message: string }>(`/services/${id}`);
        return response.data;
    },
};

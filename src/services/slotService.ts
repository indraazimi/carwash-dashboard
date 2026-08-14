import apiClient from '@/api/apiClient';
import { SlotAvailabilityResponse } from '@/types/slot';

export const slotService = {
    getSlotAvailability: async (date: string, locationId?: number | string): Promise<SlotAvailabilityResponse> => {
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

        const params: Record<string, any> = { date };
        if (locId !== undefined && locId !== null) {
            params.locationId = locId;
        }

        const response = await apiClient.get<SlotAvailabilityResponse>('/slots/availability', {
            params
        });
        return response.data;
    },
};

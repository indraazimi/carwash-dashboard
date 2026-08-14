import { useQuery } from '@tanstack/react-query';
import { slotService } from '@/services/slotService';

export const useSlotAvailability = (date?: string, locationId?: number | string) => {
    const today = new Date();
    const defaultDate = date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return useQuery({
        queryKey: ['slotAvailability', defaultDate, locationId],
        queryFn: async () => {
            const response = await slotService.getSlotAvailability(defaultDate, locationId);
            return response.data;
        },
        enabled: Boolean(defaultDate),
    });
};

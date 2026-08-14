import { useQuery } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';

export const useServices = (
    type?: string,
    enabled: boolean = true,
    locationId?: number | string,
    cc?: number | string
) => {
    return useQuery({
        queryKey: ['services', type, locationId, cc],
        queryFn: async () => {
            const response = await serviceService.getServices(type, locationId, cc);
            return response.data;
        },
        enabled: enabled,
    });
};

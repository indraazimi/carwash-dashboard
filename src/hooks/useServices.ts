import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { CreateServiceRequest, Service } from '@/types/service';

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

export const useCreateService = () => {
    const queryClient = useQueryClient();
    return useMutation<{ status: string; message: string; data: Service }, Error, CreateServiceRequest>({
        mutationFn: (data) => serviceService.createService(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();
    return useMutation<{ status: string; message: string; data: Service }, Error, { id: number; data: CreateServiceRequest }>({
        mutationFn: ({ id, data }) => serviceService.updateService(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useDeleteService = () => {
    const queryClient = useQueryClient();
    return useMutation<{ status: string; message: string }, Error, number>({
        mutationFn: (id) => serviceService.deleteService(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

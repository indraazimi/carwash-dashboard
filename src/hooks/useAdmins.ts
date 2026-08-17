import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { UpdateAdminRequest } from "@/types/admin";

export const useAdmins = (page?: number, limit?: number) => {
    return useQuery({
        queryKey: ["admins", page, limit],
        queryFn: async () => {
            const response = await adminService.getAdmins(page, limit);
            return response;
        },
    });
};

export const useUpdateAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateAdminRequest }) =>
            adminService.updateAdmin(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
    });
};

export const useCreateAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateAdminRequest) => adminService.createAdmin(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
    });
};

export const useDeleteAdmin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => adminService.deleteAdmin(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
    });
};
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; username: string; email: string; phone: string; profilePhoto?: File }) =>
            adminService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
    });
};

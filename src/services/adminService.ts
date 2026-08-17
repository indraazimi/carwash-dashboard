import apiClient from "@/api/apiClient";
import { AdminManagementResponse, UpdateAdminRequest } from "@/types/admin";

export const adminService = {
    getAdmins: async (page?: number, limit?: number): Promise<AdminManagementResponse> => {
        const params: any = {};
        if (page) params.page = page;
        if (limit) params.limit = limit;

        const response = await apiClient.get<AdminManagementResponse>("/admins", { params });
        return response.data;
    },
    updateAdmin: async (id: number, data: UpdateAdminRequest): Promise<any> => {
        const response = await apiClient.put(`/admins/${id}`, data);
        return response.data;
    },
    createAdmin: async (data: UpdateAdminRequest): Promise<any> => {
        const response = await apiClient.post("/admins", data);
        return response.data;
    },
    deleteAdmin: async (id: number): Promise<any> => {
        const response = await apiClient.delete(`/admins/${id}`);
        return response.data;
    },
    updateProfile: async (data: { name: string; username: string; email: string; phone: string; profilePhoto?: File }): Promise<any> => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("username", data.username);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        if (data.profilePhoto) {
            formData.append("profilePhoto", data.profilePhoto);
        }

        const response = await apiClient.put("/admins/profile", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
};

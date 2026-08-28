import apiClient from "@/api/apiClient";
import { ReviewResponse } from "@/types/review";
import { authService } from "@/services/authService";

export const reviewService = {
    getReviews: async (locationId?: number | string, page?: number, limit?: number): Promise<ReviewResponse> => {
        let locId = locationId;
        if (!locId && typeof window !== "undefined") {
            locId = authService.getLocationId() || authService.getUser()?.locationId || undefined;
        }

        const params: any = {};
        if (locId !== undefined && locId !== null) params.locationId = locId;
        if (page) params.page = page;
        if (limit) params.limit = limit;

        const response = await apiClient.get<ReviewResponse>("/reviews", { params });
        return response.data;
    },
};

import { useQuery } from "@tanstack/react-query";
import { reviewService } from "@/services/reviewService";

export const useReviews = (locationId?: number | string, page?: number, limit?: number) => {
    return useQuery({
        queryKey: ["reviews", locationId, page, limit],
        queryFn: async () => {
            const response = await reviewService.getReviews(locationId, page, limit);
            return response;
        },
    });
};

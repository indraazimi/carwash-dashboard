import { PaginationInfo } from "./transaction";

export interface ReviewUser {
    id: number;
    name: string;
    username: string;
    photoUrl?: string | null;
}

export interface ReviewService {
    id: number;
    name: string;
}

export interface ReviewLocation {
    id: number;
    name: string;
}

export interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    user: ReviewUser;
    service: ReviewService;
    location: ReviewLocation;
}

export interface ReviewSummary {
    averageRating: number;
    totalReviews: number;
    distribution: {
        "1": number;
        "2": number;
        "3": number;
        "4": number;
        "5": number;
        [key: string]: number;
    };
}

export interface ReviewResponse {
    status: string;
    message: string;
    data: {
        reviews: Review[];
        summary?: ReviewSummary;
    };
    pagination?: PaginationInfo;
}

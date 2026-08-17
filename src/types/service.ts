export interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    vehicleType: string | null;
    minCc: number | null;
    maxCc: number | null;
    location?: {
        id: number;
        name: string;
    } | null;
}

export interface CreateServiceRequest {
    name: string;
    description: string;
    price: number;
    vehicleType: string;
    minCc?: number | null;
    maxCc?: number | null;
    locationId?: number | null;
}

export interface UpdateServiceRequest {
    id: number;
    name: string;
    description: string;
    price: number;
    vehicleType: string;
    minCc?: number | null;
    maxCc?: number | null;
    locationId?: number | null;
}

export interface ServiceResponse {
    status: string;
    message: string;
    data: Service[];
}

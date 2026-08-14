export interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    vehicleType: string | null;
    minCc: number | null;
    maxCc: number | null;
}

export interface ServiceResponse {
    status: string;
    message: string;
    data: Service[];
}

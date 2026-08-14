export interface SlotItem {
    time: string;
    queueNumber: number;
    status: 'AVAILABLE' | 'BOOKED' | string;
}

export interface SlotAvailabilityResponse {
    status: string;
    message: string;
    data: SlotItem[];
}

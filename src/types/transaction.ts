export interface Transaction {
    id: number;
    bookingNumber: string;
    vehiclePlate: string;
    vehicleType: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    servicePrice: number;
    bookingTime: string;
    estimateFinish: string;
    status: string;
    bookingMethod: string;
}

export interface TransactionResponse {
    status: string;
    message: string;
    data: {
        id: number;
        bookingNumber: string;
        status: string;
    };
}

export interface TransactionsListResponse {
    status: string;
    message: string;
    data: {
        date: string;
        transactions: Transaction[];
    };
}

export interface CreateTransactionRequest {
    name: string;
    phone: string;
    plate: string;
    vehicleType: string;
    serviceId: number;
    bookingTime?: string;
    paymentMethod?: string;
}

export interface TransactionHistory {
    id: number;
    bookingNumber: string;
    date: string;
    vehiclePlate: string;
    vehicleType: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    servicePrice: number;
    status: string;
}

export interface TransactionHistoryResponse {
    status: string;
    message: string;
    data: {
        range: {
            start: string;
            end: string;
        };
        transactions: TransactionHistory[];
    };
}

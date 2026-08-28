import apiClient from '@/api/apiClient';
import { CreateTransactionRequest, TransactionResponse, TransactionsListResponse, TransactionHistoryResponse } from '@/types/transaction';

export const transactionService = {
    getTransactions: async (date?: string, page?: number, limit?: number): Promise<TransactionsListResponse> => {
        const params: any = {};
        if (date) params.date = date;
        if (page) params.page = page;
        if (limit) params.limit = limit;

        const response = await apiClient.get<TransactionsListResponse>('/transactions', {
            params
        });
        return response.data;
    },
    updateTransactionStatus: async ({ id, status }: { id: number; status: string }): Promise<TransactionResponse> => {
        const response = await apiClient.patch<TransactionResponse>(`/transactions/${id}/status`, { status });
        return response.data;
    },
    updatePaymentMethod: async ({ id, paymentMethod }: { id: number; paymentMethod: string }): Promise<TransactionResponse> => {
        const response = await apiClient.patch<TransactionResponse>(`/transactions/${id}/payment-method`, { paymentMethod });
        return response.data;
    },
    createTransaction: async (data: CreateTransactionRequest): Promise<any> => {
        const response = await apiClient.post('/transactions', data);
        return response.data;
    },
    getTransactionHistory: async (startDate?: string, endDate?: string, page?: number, limit?: number): Promise<TransactionHistoryResponse> => {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (page) params.page = page;
        if (limit) params.limit = limit;

        const response = await apiClient.get<TransactionHistoryResponse>('/transactions/history', {
            params
        });
        return response.data;
    },
    getUserByPhone: async (phone: string): Promise<any> => {
        const response = await apiClient.get('/transactions/user-by-phone', {
            params: { phone }
        });
        return response.data;
    },
    downloadInvoice: async (bookingIds: number[]): Promise<Blob> => {
        const response = await apiClient.post('/invoices', { bookingIds }, {
            responseType: 'blob'
        });
        return response.data;
    },
};

import apiClient from '@/api/apiClient';
import { CreateTransactionRequest, TransactionResponse, TransactionsListResponse, TransactionHistoryResponse } from '@/types/transaction';

export const transactionService = {
    getTransactions: async (date?: string): Promise<TransactionsListResponse> => {
        const response = await apiClient.get<TransactionsListResponse>('/transactions', {
            params: date ? { date } : {}
        });
        return response.data;
    },
    updateTransactionStatus: async ({ id, status }: { id: number; status: string }): Promise<TransactionResponse> => {
        const response = await apiClient.patch<TransactionResponse>(`/transactions/${id}/status`, { status });
        return response.data;
    },
    createTransaction: async (data: CreateTransactionRequest): Promise<any> => {
        const response = await apiClient.post('/transactions', data);
        return response.data;
    },
    getTransactionHistory: async (startDate?: string, endDate?: string): Promise<TransactionHistoryResponse> => {
        const response = await apiClient.get<TransactionHistoryResponse>('/transactions/history', {
            params: { startDate, endDate }
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

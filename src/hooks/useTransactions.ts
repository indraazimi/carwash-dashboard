import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { CreateTransactionRequest, TransactionResponse } from '@/types/transaction';

export const useTransactions = (date?: string, page?: number, limit?: number) => {
    return useQuery({
        queryKey: ['transactions', date, page, limit],
        queryFn: async () => {
            const response = await transactionService.getTransactions(date, page, limit);
            return response;
        },
    });
};

export const useUpdateTransactionStatus = () => {
    const queryClient = useQueryClient();
    return useMutation<TransactionResponse, Error, { id: number; status: string }>({
        mutationFn: (data) =>
            transactionService.updateTransactionStatus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation<any, Error, CreateTransactionRequest>({
        mutationFn: (data) =>
            transactionService.createTransaction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['slotAvailability'] });
        },
    });
};

export const useTransactionHistory = (startDate?: string, endDate?: string, page?: number, limit?: number) => {
    return useQuery({
        queryKey: ['transactionHistory', startDate, endDate, page, limit],
        queryFn: async () => {
            const response = await transactionService.getTransactionHistory(startDate, endDate, page, limit);
            return response;
        },
    });
};

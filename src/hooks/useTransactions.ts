import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { CreateTransactionRequest, TransactionResponse } from '@/types/transaction';

export const useTransactions = (date?: string) => {
    return useQuery({
        queryKey: ['transactions', date],
        queryFn: async () => {
            const response = await transactionService.getTransactions(date);
            return response.data;
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

export const useTransactionHistory = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['transactionHistory', startDate, endDate],
        queryFn: async () => {
            const response = await transactionService.getTransactionHistory(startDate, endDate);
            return response.data;
        },
    });
};


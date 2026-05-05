import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuote, CreateQuoteInput } from '../api/quotes';
import { useRouter } from 'expo-router';

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateQuoteInput) => createQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (error) => {
      console.error("Erreur création devis:", error);
    }
  });
};

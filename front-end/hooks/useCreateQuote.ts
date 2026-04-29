import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuote, CreateQuoteInput } from '../api/quotes';
import { useRouter } from 'expo-router';

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateQuoteInput) => createQuote(data),
    onSuccess: () => {
      // Invalide le cache 'quotes' pour forcer le rafraîchissement de la liste
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      // On retourne à la liste
      router.back();
    },
    onError: (error) => {
      console.error("Erreur création devis:", error);
    }
  });
};

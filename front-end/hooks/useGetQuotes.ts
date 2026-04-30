import { useQuery } from '@tanstack/react-query';
import { getQuotes, Quote } from '../api/quotes';


export const useGetQuotes = () => {
  // on utilise useQuery (tanstack) pour récupérer les devis depuis l'api et gérer les états 
  const query = useQuery({
    queryKey: ['quotes'],
    queryFn: getQuotes,
    staleTime: 1000 * 60 * 5, 
  });

  // on calcule les statistiques des stats ici pour pas les calculer dans la vue 
  const stats = {
    totalCount: query.data?.length ?? 0,
    totalAmountTtc: query.data?.reduce((sum, q) => sum + q.totalTtc, 0) ?? 0,
    acceptedCount: query.data?.filter(q => q.status === 'accepted').length ?? 0,
  };


  // on envoie toute nos données et les états à la vue
  return {
    ...query,
    quotes: query.data ?? [],
    stats,
  };
};

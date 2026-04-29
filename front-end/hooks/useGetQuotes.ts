import { useQuery } from '@tanstack/react-query';
import { getQuotes, Quote } from '../api/quotes';

export const useGetQuotes = () => {
  const query = useQuery({
    queryKey: ['quotes'],
    queryFn: getQuotes,
    staleTime: 1000 * 60 * 5, 
  });


  const stats = {
    totalCount: query.data?.length ?? 0,
    totalAmountTtc: query.data?.reduce((sum, q) => sum + q.totalTtc, 0) ?? 0,
    acceptedCount: query.data?.filter(q => q.status === 'accepted').length ?? 0,
  };

  return {
    ...query,
    quotes: query.data ?? [],
    stats,
  };
};

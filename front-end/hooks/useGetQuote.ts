import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getQuote } from "../api/quotes";

export const useGetQuote = (id: number) => {
  return useQuery({
    queryKey: ["quotes", id],
    queryFn: () => getQuote(id),
    enabled: !!id,
  });
};

export const useInvalidateQuote = () => {
  const queryClient = useQueryClient();
  return (id: number) => {
    queryClient.invalidateQueries({ queryKey: ["quotes", id] });
    queryClient.invalidateQueries({ queryKey: ["quotes"] });
  };
};

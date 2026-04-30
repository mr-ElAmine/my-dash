import { useQuery } from "@tanstack/react-query";
import { getProspects, Prospect } from "../api/prospects";

export const useGetProspects = () => {
  const query = useQuery({
    queryKey: ["prospects"],
    queryFn: getProspects,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    prospects: query.data ?? [],
  };
};

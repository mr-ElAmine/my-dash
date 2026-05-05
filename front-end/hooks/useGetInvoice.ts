import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getInvoice } from "../api/invoices";

export const useGetInvoice = (id: number) => {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => getInvoice(id),
    enabled: !!id,
  });
};

export const useInvalidateInvoice = () => {
  const queryClient = useQueryClient();
  return (id: number) => {
    queryClient.invalidateQueries({ queryKey: ["invoices", id] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  };
};

import { useQuery } from "@tanstack/react-query";
import { getInvoices, Invoice } from "../api/invoices";

export const useGetInvoices = () => {
  const query = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
    staleTime: 1000 * 60 * 5,
  });

  const stats = {
    totalCount: query.data?.length ?? 0,
    totalAmountTtc: query.data?.reduce((sum, i) => sum + i.totalTtc, 0) ?? 0,
    paidCount: query.data?.filter((i) => i.status === "paid").length ?? 0,
    overdueCount: query.data?.filter((i) => i.status === "overdue").length ?? 0,
  };

  return {
    ...query,
    invoices: query.data ?? [],
    stats,
  };
};

export function parsePagination(query: {
  page?: string;
  limit?: string;
}): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const rawLimit = parseInt(query.limit ?? "20", 10);
  const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(100, rawLimit);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildPaginationResponse(input: {
  page: number;
  limit: number;
  total: number;
}): { page: number; limit: number; total: number } {
  return {
    page: input.page,
    limit: input.limit,
    total: input.total,
  };
}

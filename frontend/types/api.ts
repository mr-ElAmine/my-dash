export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

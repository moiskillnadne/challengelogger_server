export interface PaginationResponse {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

import { PaginationResponse } from '~/core/interfaces';

export const getPaginationMeta = (
  page: number,
  limit: number,
  totalRecords: number,
): PaginationResponse => {
  const totalPages = Math.ceil(totalRecords / limit);

  const paginationMeta: PaginationResponse = {
    totalRecords,
    totalPages,
    currentPage: page,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };

  return paginationMeta;
};

import z from 'zod';
import { ChallengeTypeValues } from '~/shared/userChallenge';
import { CreateChallengeSchema } from '~/api/userChallenge/validation.schema';

interface PaginationInput {
  page: number;
  limit: number;
  totalRecords: number;
}

export interface PaginationMeta {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
}

export const getPaginationMeta = ({
  page,
  limit,
  totalRecords,
}: PaginationInput): PaginationMeta => {
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    totalRecords,
    totalPages,
    currentPage: page,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

export const PaginationParamsSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(10).max(50),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

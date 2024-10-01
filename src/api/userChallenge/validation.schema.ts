import z from 'zod';

export interface FindByParams {
  id: string;
  userId: string;
}

export const CreateChallengeSchema = z.object({
  goal: z.string().max(100),
  startedAtDate: z.string().date(),
  duration: z.number(),
  description: z.string().max(500).or(z.null()),
});

export type CreateChallengeReqPayload = z.infer<typeof CreateChallengeSchema>;

export type CreateChallengeDBPayload = CreateChallengeReqPayload & {
  userId: string;
};

export const CreateChallengeProgressSchema = z.object({
  checkpointDate: z.string().date(),
  userChallengeId: z.string().uuid(),
});

export type CreateChallengeProgressReqPayload = z.infer<
  typeof CreateChallengeProgressSchema
>;

export type CreateChallengeProgressDBPayload =
  CreateChallengeProgressReqPayload;

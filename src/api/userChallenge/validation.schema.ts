import z from 'zod';

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

import z from 'zod';

export type updateUserLogoReqPayload = z.infer<typeof UpdateUserLogoSchema>;

export type deleteUserLogoDBPayload = {
  userId: string;
};

export type updateUserLogoDBPayload = updateUserLogoReqPayload &
  deleteUserLogoDBPayload;

export const UpdateUserLogoSchema = z.object({
  logo: z.string().base64(),
});

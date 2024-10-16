import * as zod from 'zod';

export type CreateUserSchemaType = zod.infer<typeof CreateUserSchema>;
export const CreateUserSchema = zod.object({
  email: zod
    .string({ message: 'Email should be a string' })
    .max(255, 'Email length limit is 255 symbols')
    .email('Email should be a valid email address'),
});

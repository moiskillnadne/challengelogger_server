import * as zod from 'zod';

export const LoginBodySchema = zod.object({
  email: zod
    .string({ message: 'Email should be a string' })
    .max(255, 'Email length limit is 255 symbols')
    .email('Email should be a valid email address'),
});

export const ConfirmLoginBodySchema = zod.object({
  email: zod.string({ message: 'Email should be a string' }),
  code: zod
    .string({ message: 'Code should be a string' })
    .length(6, 'Code length should be 6 symbols'),
});

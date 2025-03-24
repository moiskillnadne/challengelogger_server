import * as zod from 'zod';

export const CreateMetaSchema = zod.object({
  isWelcomeFlowPassed: zod.boolean(),
});

export const CreateFcmTokenSchema = zod.object({
  fcmToken: zod.string(),
});

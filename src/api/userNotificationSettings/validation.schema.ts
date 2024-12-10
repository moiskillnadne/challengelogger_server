import * as zod from 'zod';

export const CreateNotificcationSettingsSchema = zod.object({
  dailyReminder: zod.boolean(),
});

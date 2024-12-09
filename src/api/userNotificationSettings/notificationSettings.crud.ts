import { UserNotificationSettings } from '~/database/models/UserNotificationSettings';

export interface UserNotificationSettings {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  dailyReminder: boolean;
}

type CreateUserNotificationSettingsPayload = Omit<
  UserNotificationSettings,
  'id' | 'createdAt' | 'updatedAt'
>;

export class UserNotificationSettingsCrud {
  static async saveNotificationSettings(
    payload: CreateUserNotificationSettingsPayload,
  ) {
    return UserNotificationSettings.upsert({
      userId: payload.userId,
      dailyReminder: payload.dailyReminder,
    });
  }

  static async getNotificationSettingsByUserId(userId: string) {
    return UserNotificationSettings.findOne({ where: { userId } });
  }
}

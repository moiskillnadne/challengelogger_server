import { UserMeta } from '~/database/models/UserMeta';

export interface UserMeta {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isWelcomeFlowPassed?: boolean;
  fcmToken?: null | string;
}

type CreateUserMetaPayload = Omit<UserMeta, 'id' | 'createdAt' | 'updatedAt'>;

export class UserMetaCrud {
  static async saveMeta(payload: CreateUserMetaPayload) {
    return UserMeta.create({
      isWelcomeFlowPassed: payload.isWelcomeFlowPassed,
      userId: payload.userId,
    });
  }

  static async getMetaByUserId(userId: string) {
    return UserMeta.findOne({ where: { userId } });
  }

  static async saveFcmToken(payload: CreateUserMetaPayload) {
    const userMeta = await UserMeta.findOne({
      where: { userId: payload.userId },
    });

    if (userMeta) {
      await userMeta.update({ fcmToken: payload.fcmToken });
    } else {
      await UserMeta.create({
        userId: payload.userId,
        fcmToken: payload.fcmToken,
      });
    }
  }
}

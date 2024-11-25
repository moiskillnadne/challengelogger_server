import { UserMeta } from '~/database/models/UserMeta';

export interface UserMeta {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isWelcomeFlowPassed: boolean;
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
}

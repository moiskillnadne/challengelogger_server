import { CreateChallengeDBPayload } from './validation.schema';

import { UserChallenge } from '~/database/models/UserChallenge';

interface FindByIdAndUserPayload {
  id: string;
  userId: string;
}

export class UserChallengeCrud {
  static findByIdAndUser(payload: FindByIdAndUserPayload) {
    return UserChallenge.findOne({
      where: {
        id: payload.id,
        userId: payload.userId,
      },
    });
  }

  static create(payload: CreateChallengeDBPayload) {
    return UserChallenge.create(payload);
  }
}

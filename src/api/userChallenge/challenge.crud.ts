import { CreateChallengeDBPayload, FindByParams } from './validation.schema';

import { UserChallenge } from '~/database/models/UserChallenge';

export class UserChallengeCrud {
  static findByParams(params: FindByParams) {
    return UserChallenge.findOne({
      where: {
        id: params.id,
        userId: params.userId,
      },
    });
  }

  static create(payload: CreateChallengeDBPayload) {
    return UserChallenge.create(payload);
  }
}

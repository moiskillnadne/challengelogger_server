import { CreateChallengeDBPayload, FindByParams } from './validation.schema';

import { UserChallenge } from '~/database/models/UserChallenge';

export class UserChallengeCrud {
  static findManyByUserId(userId: string) {
    return UserChallenge.findAll({
      where: {
        userId,
      },
    });
  }

  static findOneByParams(params: FindByParams) {
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

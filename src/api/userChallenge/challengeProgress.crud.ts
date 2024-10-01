import { CreateChallengeProgressReqPayload } from './validation.schema';

import { UserChallengeProgress } from '~/database/models/UserChallengeProgress';

interface FindByChallengeId {
  challengeId: string;
}

export class UserChallengeProgressCrud {
  static create(payload: CreateChallengeProgressReqPayload) {
    return UserChallengeProgress.create(payload);
  }

  static findByChallengeId(params: FindByChallengeId) {
    return UserChallengeProgress.findAll({
      where: {
        userChallengeId: params.challengeId,
      },
      attributes: ['id', 'checkpointDate', 'createdAt'],
      order: [['checkpointDate', 'ASC']],
    });
  }
}

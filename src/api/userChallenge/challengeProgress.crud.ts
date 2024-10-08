import { CreateChallengeProgressReqPayload } from './validation.schema';

import { UserChallenge } from '~/database/models/UserChallenge';
import { UserChallengeProgress } from '~/database/models/UserChallengeProgress';

interface FindByChallengeId {
  challengeId: string;
}

export class UserChallengeProgressCrud {
  static create(payload: CreateChallengeProgressReqPayload) {
    return UserChallengeProgress.create(payload);
  }

  static deleteOne(id: string) {
    return UserChallengeProgress.destroy({
      where: {
        id,
      },
    });
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

  static findByIdJoinChallenge(progressId: string) {
    return UserChallengeProgress.findOne({
      where: {
        id: progressId,
      },
      include: [
        {
          model: UserChallenge,
          as: 'userChallenge',
          attributes: ['id', 'goal', 'startedAtDate', 'duration', 'userId'],
        },
      ],
    });
  }
}

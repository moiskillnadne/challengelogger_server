import { CreateChallengeDBPayload, FindByParams } from './validation.schema';
import { UserChallengeProgress } from '~/database/models/UserChallengeProgress';

import { UserChallenge } from '~/database/models/UserChallenge';
import { ChallengeStatus } from '~/shared/userChallenge';
import { PaginationRequest } from '~/core/interfaces';
import { getPaginationMeta } from '~/core/utils';

type WhereClause = {
  userId: string;
  status?: ChallengeStatus;
};

type FindManyParams = {
  whereClause: WhereClause;
  paginationParams: PaginationRequest;
};

export class UserChallengeCrud {
  static findManyByUserId(userId: string) {
    return UserChallenge.findAll({
      where: {
        userId,
      },
    });
  }

  static async findMany({ whereClause, paginationParams }: FindManyParams) {
    const { page, limit } = paginationParams;

    const offset = (page - 1) * limit;

    const { rows: challenges, count: totalRecords } =
      await UserChallenge.findAndCountAll({
        where: whereClause,
        limit,
        offset,
      });

    const paginationMeta = getPaginationMeta(page, limit, totalRecords);

    return {
      data: challenges,
      pagination: paginationMeta,
    };
  }

  static findOneByParams(params: FindByParams) {
    return UserChallenge.findOne({
      where: {
        id: params.id,
        userId: params.userId,
      },
    });
  }

  static findOneByParamsWithProgress(params: FindByParams) {
    return UserChallenge.findOne({
      where: {
        id: params.id,
        userId: params.userId,
      },
      include: [
        {
          model: UserChallengeProgress,
          as: 'progress',
        },
      ],
    });
  }

  static create(payload: CreateChallengeDBPayload) {
    return UserChallenge.create(payload);
  }

  static deleteOneByParams(params: FindByParams) {
    return UserChallenge.destroy({
      where: {
        id: params.id,
        userId: params.userId,
      },
    });
  }
}

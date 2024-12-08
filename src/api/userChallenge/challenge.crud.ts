import { CreateChallengeDBPayload, FindByParams } from './validation.schema';

import { getPaginationMeta, PaginationParams } from '~/core/utils';
import { UserChallenge } from '~/database/models/UserChallenge';
import { UserChallengeProgress } from '~/database/models/UserChallengeProgress';
import { ChallengeStatus } from '~/shared/userChallenge';

interface WhereClause {
  userId: string;
  status?: ChallengeStatus;
}

interface FindManyParams {
  whereClause: WhereClause;
  paginationParams: PaginationParams;
}

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

    console.log(
      `page: ${page}, limit: ${limit}, offset: ${offset}, status: ${whereClause.status}`,
    );

    const { rows: challenges, count: totalRecords } =
      await UserChallenge.findAndCountAll({
        where: {
          userId: whereClause.userId,
          status: whereClause.status,
        },
        limit,
        offset,
      });

    const paginationMeta = getPaginationMeta({ page, limit, totalRecords });

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

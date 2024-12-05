import { CreateChallengeDBPayload, FindByParams } from './validation.schema';
import { UserChallengeProgress } from '../../database/models/UserChallengeProgress';

import { UserChallenge } from '~/database/models/UserChallenge';
import { ChallengeStatus } from '~/shared/userChallenge';

export class UserChallengeCrud {
  static findManyByUserId(userId: string) {
    return UserChallenge.findAll({
      where: {
        userId,
      },
    });
  }

  static async findMany(
    userId: string,
    status: ChallengeStatus,
    page: number = 1,
    limit: number = 100,
  ) {
    const offset = (page - 1) * limit;

    const whereClause: any = { userId };
    if (status) {
      whereClause.status = status;
    }

    const { rows: challenges, count: totalRecords } =
      await UserChallenge.findAndCountAll({
        where: whereClause,
        limit,
        offset,
      });

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      data: challenges,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
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

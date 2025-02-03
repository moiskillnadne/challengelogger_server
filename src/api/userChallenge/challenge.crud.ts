import { CreateChallengeDBPayload, FindByParams } from './validation.schema';

import { getPaginationMeta, PaginationParams } from '~/core/utils';
import Sequelize from '~/database/connection';
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

  static async completeAllActiveChallenges() {
    const UPDATE_QUERY_LIMIT = 5000;
    const TABLE_NAME = 'userChallenge';

    try {
      const transaction = await Sequelize.transaction();

      try {
        await Sequelize.query('PRAGMA journal_mode = MEMORY;', { transaction });

        await Sequelize.query(
          `UPDATE ${TABLE_NAME}
                 SET status = "COMPLETED" 
                 WHERE id IN (
                     SELECT id FROM ${TABLE_NAME} 
                     WHERE status = "ACTIVE" 
                     LIMIT :limit
                 );`,
          {
            replacements: {
              limit: UPDATE_QUERY_LIMIT,
            },
            transaction,
          },
        );

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        console.error('[Complete All Active Challenges] Update failed:', error);
      }
    } catch (error) {
      console.error(
        '[Complete All Active Challenges] Transaction execution failed:',
        error,
      );
    }
  }
}

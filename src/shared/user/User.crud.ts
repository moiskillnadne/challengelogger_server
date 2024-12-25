import { Model } from 'sequelize';

import { CreateUserSchemaType, UpdateUserDBPayload } from './schema';
import { UserCredential } from '../../database/models/UserCredential';

import { User } from '~/database/models/User';

export class UserCrudService {
  static async createUser(
    data: CreateUserSchemaType,
  ): Promise<Model<typeof User>> {
    return User.create(data);
  }

  static async getUserByEmail(
    email: string,
  ): Promise<Model<typeof User> | null> {
    return User.findOne({ where: { email } });
  }

  // Result [User, isCreated]
  static async createOrGet(
    email: string,
  ): Promise<[Model<typeof User>, boolean]> {
    return User.findOrCreate({ where: { email } }).then(([user, isCreated]) => [
      user,
      isCreated,
    ]);
  }

  static async getUserByEmailWithCredentials(email: string) {
    return User.findOne({
      where: { email },
      include: [
        {
          model: UserCredential,
          as: 'credentials',
        },
      ],
    });
  }

  static update(updatePayload: UpdateUserDBPayload, userId: string) {
    return User.update(updatePayload, {
      where: {
        id: userId,
      },
    });
  }

  static deleteLogo(userId: string) {
    return User.update(
      {
        logo: null,
      },
      {
        where: {
          id: userId,
        },
      },
    );
  }
}

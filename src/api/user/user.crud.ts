import {
  deleteUserLogoDBPayload,
  updateUserLogoDBPayload,
} from './validation.schema';

import { User } from '~/database/models/User';

export class UserCrud {
  static update(payload: updateUserLogoDBPayload) {
    return User.update(
      {
        logo: payload.logo,
      },
      {
        where: {
          id: payload.userId,
        },
      },
    );
  }

  static delete(payload: deleteUserLogoDBPayload) {
    return User.update(
      {
        logo: null,
      },
      {
        where: {
          id: payload.userId,
        },
      },
    );
  }
}

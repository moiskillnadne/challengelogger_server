import { Model } from 'sequelize';

import { UserCredential } from '~/database/models/UserCredential';

interface CreateCredentialPayload {
  credId: string;
  publicKey: Uint8Array;
  webauthnUserID: string;
  counter: number;
  deviceType: string;
  backedUp: boolean;
  transports?: string[];
  userId: string;
}

interface UpdateCredentialCounterPayload {
  credId: string;
  counter: number;
}

export class UserCredentialCrudService {
  static async getCredentialByUserId(
    userId: string,
  ): Promise<Model<typeof UserCredential>[] | null> {
    return UserCredential.findAll({ where: { userId } });
  }

  static async saveCredential(payload: CreateCredentialPayload) {
    return UserCredential.create({
      credId: payload.credId,
      publicKey: payload.publicKey,
      webauthnUserID: payload.webauthnUserID,
      counter: payload.counter,
      deviceType: payload.deviceType,
      backedUp: payload.backedUp,
      transports: payload.transports,
      userId: payload.userId,
    });
  }

  static async updateCredentialCounter(
    payload: UpdateCredentialCounterPayload,
  ) {
    return UserCredential.update(
      { counter: payload.counter },
      { where: { credId: payload.credId } },
    );
  }
}

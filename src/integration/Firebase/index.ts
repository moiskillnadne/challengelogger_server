import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { FireBaseMessage } from './types';
import { logger } from '~/core/logger';
const serviceAccount = require('./firebaseServiceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

const messaging = admin.messaging();

export const sendNotification = async (
  token: string,
  message: FireBaseMessage,
): Promise<string | null> => {
  const payload: admin.messaging.Message = {
    token,
    notification: {
      title: message.title,
      body: message.body,
    },
    data: message.data || {},
  };

  try {
    const messageId = await messaging.send(payload);

    return messageId;
  } catch (error) {
    logger.error(`Error sending notification: ${error}`);

    return null;
  }
};

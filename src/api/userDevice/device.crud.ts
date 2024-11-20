import { UserDevice } from '~/database/models/UserDevice';

export interface UserDevice {
  id: string;
  createdAt: string;
  updatedAt: string;
  fingerprint: string;
  platform: string;
  platformVersion: string;
  browser: string;
  browserVersion: string;
  screenResolution: string;
  colorDepth: string;
  pixelDepth: string;
  webGLFingerprint: string;
  pixelRatio: string;
  maxTouchPoints: string;
  isTouchScreen: boolean;
  canvasFingerprint: string;
  userAgent: string;
  userId: string;
}

type CreateUserDevice = Omit<UserDevice, 'id' | 'createdAt' | 'updatedAt'>;

export type UserDeviceResult = Omit<
  UserDevice,
  'fingerprint' | 'canvasFingerprint'
> & { id: string; createdAt: string; updatedAt: string };

interface DeleteByParams {
  id: string;
  userId: string;
}

export class UserDeviceCrud {
  static async saveDevice(payload: CreateUserDevice) {
    return UserDevice.create({
      fingerprint: payload.fingerprint,
      platform: payload.platform,
      platformVersion: payload.platformVersion,
      browser: payload.browser,
      browserVersion: payload.browserVersion,
      screenResolution: payload.screenResolution,
      colorDepth: payload.colorDepth,
      pixelDepth: payload.pixelDepth,
      webGLFingerprint: payload.webGLFingerprint,
      pixelRatio: payload.pixelRatio,
      maxTouchPoints: payload.maxTouchPoints,
      isTouchScreen: payload.isTouchScreen,
      canvasFingerprint: payload.canvasFingerprint,
      userAgent: payload.userAgent,
      userId: payload.userId,
    });
  }

  static async getDevicesByUserId(userId: string) {
    return UserDevice.findAll({ where: { userId } });
  }

  static deleteOneByParams(params: DeleteByParams) {
    return UserDevice.destroy({
      where: {
        id: params.id,
        userId: params.userId,
      },
    });
  }
}

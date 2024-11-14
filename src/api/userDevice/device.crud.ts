import { UserDevice } from '~/database/models/UserDevice';

interface CreateDevicePayload {
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

export class UserDeviceCrud {
  static async saveCredential(payload: CreateDevicePayload) {
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
}

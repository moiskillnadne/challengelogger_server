import * as zod from 'zod';

export const CreateDeviceSchema = zod.object({
  fingerprint: zod.string(),
  platform: zod.string(),
  platformVersion: zod.string(),
  browser: zod.string(),
  browserVersion: zod.string(),
  screenResolution: zod.string(),
  colorDepth: zod.string(),
  pixelDepth: zod.string(),
  webGLFingerprint: zod.string(),
  pixelRatio: zod.string(),
  maxTouchPoints: zod.string(),
  isTouchScreen: zod.boolean(),
  canvasFingerprint: zod.string(),
  userAgent: zod.string(),
});

export const mapToOTPKey = (key: string): string => `otp:${key}`;

export const mapToRefreshTokenKey = (key: string): string =>
  `refresh-token:${key}`;

export const mapToChallengeKey = (key: string): string => `challenge:${key}`;

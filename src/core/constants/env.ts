export const Env = {
  APP_PORT: process.env.PORT,
  APP_ENV: process.env.ENV,

  DB_PATH: process.env.SQLITE_DB_PATH,

  SENTRY_DSN: process.env.SENTRY_DSN,
  SENGRID_API_KEY: process.env.SENDGRID_API_KEY,
  LOGIN_OTP_TEMPLATE_ID: process.env.LOGIN_OTP_TEMPLATE_ID,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  CLOUD_WATCH_LOG_GROUP: process.env.CLOUD_WATCH_LOG_GROUP,
  CLOUD_WATCH_LOG_STREAM: process.env.CLOUD_WATCH_LOG_STREAM,

  AWS_REGION: process.env.AWS_REGION,

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,

  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_DB: process.env.REDIS_DB,
};

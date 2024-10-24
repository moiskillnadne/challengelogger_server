const esbuild = require('esbuild');
const { dependencies } = require('./package.json');

const env = {
  'process.env.ENV': JSON.stringify(process.env.ENV),
  'process.env.PORT': JSON.stringify(process.env.PORT),
  'process.env.SQLITE_DB_PATH': JSON.stringify(process.env.SQLITE_DB_PATH),
  'process.env.SENDGRID_API_KEY': JSON.stringify(process.env.SENDGRID_API_KEY),
  'process.env.JWT_ACCESS_SECRET': JSON.stringify(process.env.JWT_ACCESS_SECRET),
  'process.env.JWT_REFRESH_SECRET': JSON.stringify(process.env.JWT_REFRESH_SECRET),
  'process.env.CLOUD_WATCH_LOG_GROUP': JSON.stringify(process.env.CLOUD_WATCH_LOG_GROUP),
  'process.env.CLOUD_WATCH_LOG_STREAM': JSON.stringify(process.env.CLOUD_WATCH_LOG_STREAM),
  'process.env.AWS_REGION': JSON.stringify(process.env.AWS_REGION),
  'process.env.AWS_ACCESS_KEY_ID': JSON.stringify(process.env.AWS_ACCESS_KEY_ID),
  'process.env.AWS_SECRET_KEY': JSON.stringify(process.env.AWS_SECRET_KEY),
  'process.env.LOGIN_OTP_TEMPLATE_ID': JSON.stringify(process.env.LOGIN_OTP_TEMPLATE_ID),
  'process.env.REDIS_HOST': JSON.stringify(process.env.REDIS_HOST),
  'process.env.REDIS_PORT': JSON.stringify(process.env.REDIS_PORT),
  'process.env.REDIS_DB': JSON.stringify(process.env.REDIS_DB),
};


esbuild
  .build({
    entryPoints: ['./src/index.ts'], // Entry point
    bundle: true,
    platform: 'node',
    outdir: 'dist', // Outdir
    target: 'node22', // Node version
    tsconfig: './tsconfig.json', // Path to tsconfig
    alias: {
      '~': './src', // Alias
    },
    external: Object.keys(dependencies), // External dependencies
    define: {
      ...env,
    },
    minify: true,
  })
  .catch(() => process.exit(1));

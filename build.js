const esbuild = require('esbuild');
const { dependencies } = require('./package.json');

const env = {
  'process.env.ENV': JSON.stringify(process.env.ENV),
  'process.env.PORT': JSON.stringify(process.env.PORT),
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

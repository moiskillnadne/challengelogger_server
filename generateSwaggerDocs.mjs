import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'node:path';

import UserDeviceSwagger from "./src/api/userDevice/swaggerDocs.js";
import UserMetaSwagger from "./src/api/userMeta/swaggerDocs.js";
import UserNotificationSettingsSwagger from "./src/api/userNotificationSettings/swaggerDocs.js";
import ChallengeSwagger from "./src/api/userChallenge/swaggerDocs.js";
import UserSwagger from "./src/api/user/swaggerDocs.js";
import PasskeysSwagger from './src/api/passkeys/swaggerDocs.js'
import AuthSwagger from './src/api/auth/swaggerDocs.js'
import CounterSwagger from './src/api/counter/swaggerDocs.js'





const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Challengelogger API', // Название API
      version: '1.0.0', // Версия API
    },
     servers: [],
  },
  apis: ['./src/**/*.ts'], // Пути к файлам с комментариями
};

const swaggerSpec = swaggerJsdoc(options);


swaggerSpec.paths = {
  ...swaggerSpec.paths,
  ...UserDeviceSwagger.paths,
  ...UserMetaSwagger.paths,
  ...UserNotificationSettingsSwagger.paths,
  ...ChallengeSwagger.paths,
  ...UserSwagger.paths,
  ...PasskeysSwagger.paths,
  ...AuthSwagger.paths,
  ...CounterSwagger.paths,
};

const outputDir = './dist';
const outputPath = path.join(outputDir, 'swagger.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log('Swagger documentation generated successfully!');

import jsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Challengelogger API', // Название API
      version: '1.0.0', // Версия API
    },
    servers: [
      {
        url: 'http://localhost:3001', // Базовый URL
      },
    ],
  },
  apis: ['./src/**/*.ts'], // Пути к файлам с комментариями
};

export const swaggerSpecs = jsdoc(options);

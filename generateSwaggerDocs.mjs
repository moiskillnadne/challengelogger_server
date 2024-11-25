import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';

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

fs.writeFileSync('./dist/swagger.json', JSON.stringify(swaggerSpec, null, 2));
console.log('Swagger documentation generated successfully!');

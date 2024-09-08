import express from 'express';

import AuthRouter from '~/api/auth';
import { Sequelize } from '~/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/auth', AuthRouter);

app.listen(PORT, async () => {
  console.info(`Server is running on port ${PORT}`);

  try {
    await Sequelize.authenticate();
    console.info('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

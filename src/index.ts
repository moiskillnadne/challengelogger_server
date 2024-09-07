import express, { Request, Response } from 'express';

import { Sequelize } from '~/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await Sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

import express, { Request, Response } from 'express';

import { User } from './database/entities/User';

import { Sequelize } from '~/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/', async (req: Request, res: Response) => {
  const body = req.body;

  if (!body?.email) {
    return res.status(400).send('Email is required');
  }

  try {
    const user = User.build({ email: body.email });

    await user.save();
  } catch (error) {
    console.error('Error:', error);
    return res.status(404).send('Error');
  }

  res.send('Hello World!');
});

app.listen(PORT, async () => {
  console.info(`Server is running on port ${PORT}`);

  try {
    await Sequelize.authenticate();
    console.info('Connection has been established successfully.');

    await Sequelize.sync();
    // await Sequelize.drop();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

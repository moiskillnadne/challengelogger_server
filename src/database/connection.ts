import { Sequelize } from 'sequelize';

import { Env } from '~/core/constants';

export default new Sequelize({
  dialect: 'sqlite',
  storage: Env.DB_PATH || 'db.sqlite',
  logging: false,
  benchmark: false,
  define: {
    freezeTableName: true,
  },
});

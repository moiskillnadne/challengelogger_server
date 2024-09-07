import { Sequelize } from 'sequelize';

export default new Sequelize({
  dialect: 'sqlite',
  storage: process.env.SQLITE_DB_PATH || 'db.sqlite',
  logging: false,
  benchmark: false,
  define: {
    freezeTableName: true,
  },
});

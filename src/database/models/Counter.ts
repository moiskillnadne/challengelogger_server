import { DataTypes } from 'sequelize';

import Sequelize from '../connection';
import { User } from './User';

export const CounterEntity = Sequelize.define(
  'counter',
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
      validate: {
        min: 1,
        max: 100,
      },
    },

    counter: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    userId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      unique: false,
      references: {
        model: User,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {},
);

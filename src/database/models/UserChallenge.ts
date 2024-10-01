import { DataTypes } from 'sequelize';

import Sequelize from '../connection';
import { User } from './User';

export const UserChallenge = Sequelize.define(
  'userChallenge',
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    goal: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
      validate: {
        min: 1,
        max: 100,
      },
    },
    startedAtDate: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
      validate: {
        isDate: true,
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
      validate: {
        isNumeric: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false,
      validate: {
        max: 500,
      },
    },

    userId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
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

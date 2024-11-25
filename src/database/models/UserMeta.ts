import { DataTypes } from 'sequelize';

import Sequelize from '../connection';
import { User } from './User';

export const UserMeta = Sequelize.define(
  'userMeta',
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    isWelcomeFlowPassed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      unique: false,
      defaultValue: false,
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

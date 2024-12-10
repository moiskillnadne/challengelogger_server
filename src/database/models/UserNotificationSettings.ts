import { DataTypes } from 'sequelize';

import Sequelize from '../connection';
import { User } from './User';

export const UserNotificationSettings = Sequelize.define(
  'userNotificationSettings',
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    dailyReminder: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: [[true, false]],
      },
    },

    userId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
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

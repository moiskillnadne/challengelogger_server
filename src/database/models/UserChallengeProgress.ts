import { DataTypes } from 'sequelize';

import Sequelize from '../connection';
import { UserChallenge } from './UserChallenge';

export const UserChallengeProgress = Sequelize.define(
  'userChallengeProgress',
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    checkpointDate: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
      validate: {
        isDate: true,
      },
    },

    userChallengeId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      references: {
        model: UserChallenge,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['userChallengeId', 'checkpointDate'],
      },
    ],
  },
);

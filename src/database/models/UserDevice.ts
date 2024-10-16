import { DataTypes } from 'sequelize';

import Sequelize from '../connection';
import { User } from './User';

export const UserDevice = Sequelize.define(
  'userDevice',
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    fingerprint: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    platform: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    platformVersion: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    browser: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    browserVersion: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    screenResolution: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    colorDepth: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    pixelDepth: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    webGLFingerprint: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    pixelRatio: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    maxTouchPoints: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    isTouchScreen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      unique: false,
    },

    canvasFingerprint: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    userAgent: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
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

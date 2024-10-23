import { DataTypes } from 'sequelize';

import Sequelize from '../connection';
import { User } from './User';

export const UserCredential = Sequelize.define(
  'userCredential',
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    credId: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },

    publicKey: {
      type: DataTypes.BLOB,
      allowNull: false,
      get() {
        const storedValue = this.getDataValue('publicKey');
        return storedValue ? new Uint8Array(storedValue) : null;
      },
      set(value) {
        this.setDataValue('publicKey', Buffer.from(value as Uint8Array));
      },
    },

    webauthnUserID: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    counter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    deviceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    backedUp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    transports: {
      type: DataTypes.TEXT, // Store as JSON string
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('transports');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('transports', JSON.stringify(value));
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
  {
    indexes: [
      {
        unique: true,
        fields: ['credId'],
      },
    ],
  },
);

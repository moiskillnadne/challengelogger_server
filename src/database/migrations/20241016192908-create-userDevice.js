'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('userDevice', {
      id: {
        type: Sequelize.UUIDV4,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      
      fingerprint: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      platform: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      platformVersion: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      browser: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      browserVersion: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      screenResolution: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      colorDepth: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      pixelDepth: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      webGLFingerprint: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      pixelRatio: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      maxTouchPoints: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      isTouchScreen: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        unique: false,
      },
  
      canvasFingerprint: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
      },
  
      userId: {
        type: Sequelize.UUIDV4,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('userDevice');
  }
};

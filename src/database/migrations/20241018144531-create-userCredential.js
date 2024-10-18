'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('userCredential', {
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
      
      credId: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
  
      publicKey: {
        type: Sequelize.BLOB,
        allowNull: false,
      },
  
      webauthnUserID: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
  
      counter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
  
      deviceType: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
  
      backedUp: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
  
      transports: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    await queryInterface.addIndex('userCredential', ['credId'], {
      unique: true,
      name: 'idx_userCredential_credId',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('userCredential', 'idx_userCredential_credId');
    await queryInterface.dropTable('userCredential');
  }
};

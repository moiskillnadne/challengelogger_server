'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('userChallenge', {
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
      goal: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
        validate: {
          min: 1,
          max: 100,
        },
      },
      startedAtDate: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
        validate: {
          isDate: true,
        },
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false,
        validate: {
          isNumeric: true,
        },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        unique: false,
        validate: {
          max: 500,
        },
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
    await queryInterface.dropTable('userChallenge');
  }
};

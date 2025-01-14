'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('counter', {
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

      name: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: false,
        validate: {
          min: 1,
        },
      },

      counter: {
        type: Sequelize.NUMBER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },

      userId: {
        type: Sequelize.UUIDV4,
        allowNull: false,
        unique: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('counter');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('userMeta', 'fcmToken', {
      type: Sequelize.TEXT,
      allowNull: true,
      unique: false,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('userMeta', 'fcmToken');
  },
};

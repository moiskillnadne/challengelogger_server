'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('userChallenge', 'status', {
      type: Sequelize.TEXT,
      allowNull: true,
      unique: false,
      defaultValue: 'ACTIVE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('userChallenge', 'status');
  },
};

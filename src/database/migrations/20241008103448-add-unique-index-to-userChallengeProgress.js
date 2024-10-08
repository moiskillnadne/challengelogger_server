'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('userChallengeProgress', ['checkpointDate', 'userChallengeId'], {
      unique: true,
      name: 'unique_checkpointDate_userChallengeId',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('userChallengeProgress', 'unique_checkpointDate_userChallengeId');
  }
};

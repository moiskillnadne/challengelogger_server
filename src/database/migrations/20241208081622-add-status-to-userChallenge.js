'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { Op } = Sequelize;

    await queryInterface.addColumn('userChallenge', 'status', {
      type: Sequelize.TEXT,
      allowNull: true,
      unique: false,
      defaultValue: null,
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    console.log(currentMonth);

    const formattedCurrentMonth = ('0' + currentMonth).slice(-2);

    console.log(formattedCurrentMonth);

    await queryInterface.bulkUpdate(
      'userChallenge',
      { status: 'ACTIVE' },
      Sequelize.and(
        Sequelize.where(
          Sequelize.fn('substr', Sequelize.col('startedAtDate'), 6, 2), // Extract month from string with format YYYY-MM-DD
          formattedCurrentMonth,
        ),
        Sequelize.where(
          Sequelize.fn('substr', Sequelize.col('startedAtDate'), 1, 4), // Extract year from string with format YYYY-MM-DD
          currentYear.toString(),
        ),
      ),
    );

    await queryInterface.bulkUpdate(
      'userChallenge',
      { status: 'COMPLETED' },
      { status: null },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('userChallenge', 'status');
  },
};

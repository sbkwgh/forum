'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('userip', {
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,

      IpId: Sequelize.INTEGER,
      UserId: Sequelize.INTEGER
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('userip');
  }
};

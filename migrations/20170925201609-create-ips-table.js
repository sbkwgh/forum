'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ips', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,

      ip: Sequelize.STRING(45)
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ips');
  }
};

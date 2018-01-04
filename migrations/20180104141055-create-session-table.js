'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('sessions', {
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      
      sid: {
        type: Sequelize.STRING(32),
        primaryKey: true
      },
      expires: Sequelize.DATE,
      data: Sequelize.TEXT
    }, {
      charset: 'utf8mb4'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('sessions');
  }
};
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('AdminTokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      
      token: Sequelize.STRING
    }, {
      charset: 'utf8mb4'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('AdminTokens');
  }
};

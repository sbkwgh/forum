'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      
      forumName: Sequelize.STRING,
      forumDescription: Sequelize.STRING
    }, {
      charset: 'utf8mb4'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('settings');
  }
};

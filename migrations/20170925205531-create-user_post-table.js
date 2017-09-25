'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_post', {
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      
      PostId: Sequelize.INTEGER,
      UserId: Sequelize.INTEGER
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_post');
  }
};

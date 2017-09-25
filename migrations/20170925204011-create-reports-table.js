'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('reports', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      
      reason: {
        type: Sequelize.ENUM,
        values: ['spam', 'inappropriate', 'harassment']
      },

      FlaggedByUserId: Sequelize.INTEGER,
      PostId: Sequelize.INTEGER
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('reports');
  }
};

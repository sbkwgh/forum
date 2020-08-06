'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Bans', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      canCreatePosts: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      canCreateThreads: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      ipBanned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      message: Sequelize.TEXT,
      UserId: Sequelize.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    }, {
      charset: 'utf8mb4'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Bans');
  }
};

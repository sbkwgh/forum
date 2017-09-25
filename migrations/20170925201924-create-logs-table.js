'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,

      route: DataTypes.ENUM([
        'index',
        'search',
        'settingsAccount',
        'settingsGeneral',
        'thread',
        'threadNew',
        'userPosts',
        'userThreads'
      ]),
      ThreadId: Sequelize.INTEGER,
      UserId: Sequelize.INTEGER,
      SessionUserId: Sequelize.INTEGER
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('logs');
  }
};

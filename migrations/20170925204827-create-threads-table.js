'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Threads', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: Sequelize.TEXT,
      postsCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      locked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      CategoryId: Sequelize.INTEGER,
      UserId: Sequelize.INTEGER,
      PollQuestionId: Sequelize.INTEGER
    }, {
      charset: 'utf8mb4'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Threads');
  }
};

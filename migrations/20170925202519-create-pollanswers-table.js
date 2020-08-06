'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('PollAnswers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      
      answer: {
        type: Sequelize.STRING,
        allowNull: false
      },
      PollQuestionId: Sequelize.INTEGER
    }, {
      charset: 'utf8mb4'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('PollAnswers');
  }
};

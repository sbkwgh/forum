'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,

      name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING,
        unique: true
      },
      color: Sequelize.STRING
    }, {
      charset: 'utf8mb4'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('categories');
  }
};

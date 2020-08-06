'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,

      name: {
        type: Sequelize.STRING(191),
        unique: true,
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING(191),
        unique: true
      },
      color: Sequelize.STRING
    }, {
      charset: 'utf8mb4'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Categories');
  }
};

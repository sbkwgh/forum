'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,

      username: {
        type: Sequelize.STRING(191),
        unique: true,
      },
      description: Sequelize.TEXT,
      color: Sequelize.TEXT,
      hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    }, {
      charset: 'utf8mb4'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};

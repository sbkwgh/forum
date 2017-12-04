'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'picture', {
      type: Sequelize.TEXT('long')
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropColumn('users', 'picture')
  }
};

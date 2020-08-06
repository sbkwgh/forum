'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'picture', {
      type: Sequelize.TEXT('long')
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropColumn('Users', 'picture')
  }
};

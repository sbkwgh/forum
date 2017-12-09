'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('profilepictures', 'mimetype', {
      type: Sequelize.STRING
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropColumn('profilepictures', 'mimetype')
  }
};

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('ProfilePictures', 'mimetype', {
      type: Sequelize.STRING
    })
  },

  down: (queryInterface) => {
    return queryInterface.dropColumn('ProfilePictures', 'mimetype')
  }
};

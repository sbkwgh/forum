'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING,
      unique: true
    })
  },

  down: function (queryInterface, Sequelize) {
    sequelize.query(
      'ALTER TABLE users DROP CONSTRAINT username_unique_idx;'
    );
    queryInterface.removeIndex('Users', 'username_unique_idx');
  }
};

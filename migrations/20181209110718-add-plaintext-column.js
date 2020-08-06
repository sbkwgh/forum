let cheerio = require('cheerio');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Posts', 'plainText', {
      type: Sequelize.TEXT
    });

    let posts = await queryInterface.sequelize.query(
      'SELECT id, content FROM Posts',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    let promises = posts.map(post => {
      let replacements = {
        id: post.id,
        text: cheerio(post.content).text()
      }

      return queryInterface.sequelize.query(
        'UPDATE Posts SET plainText = :text WHERE id = :id',
        { replacements }       
      )
    });

    return Promise.all(promises);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Posts', 'plainText');
  }
};

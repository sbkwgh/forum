let cheerio = require('cheerio');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('posts', 'plainText', {
      type: Sequelize.TEXT
    });

    let posts = await queryInterface.sequelize.query(
      'SELECT id, content FROM posts',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    let promises = posts.map(post => {
      let replacements = {
        id: post.id,
        text: cheerio(post.content).text()
      }

      return queryInterface.sequelize.query(
        'UPDATE posts SET plainText = :text WHERE id = :id',
        { replacements }       
      )
    });

    return Promise.all(promises);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('posts', 'plainText');
  }
};

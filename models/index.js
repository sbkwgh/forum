const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const config = require('../config/config.json');
const env = process.env.NODE_ENV || 'development';
const db = {};

let options = {
	define: {
		charset: 'utf8mb4',
		collate: 'utf8mb4_general_ci'
	},
	dialectOptions: {
		charset: 'utf8mb4'
	}
}
if(env === 'production') {
	var sequelize = new Sequelize(process.env.DATABASE_URL, options)
} else {
	var sequelize = new Sequelize(
		config[env].database, config[env].username, config[env].password, {
			host: config[env].host,
			dialect: config[env].dialect,
			logging: false,
			...options
		}
	);
}

fs
	.readdirSync(__dirname)
	.filter(file =>
		(file.indexOf('.') !== 0) &&
		(file !== basename) &&
		(file.slice(-3) === '.js'))
	.forEach(file => {
		const model = sequelize.import(path.join(__dirname, file));
		db[model.name] = model;
	});

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
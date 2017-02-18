let express = require('express')
let app = express()

let sequelize = require('./models').sequelize

let config = require('./config/server.js')

//Middle-ware
let bodyParser = require('body-parser')
let morgan = require('morgan')
let session = require('express-session')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {}
}))

if(process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
	app.use(morgan('dev'))
}
if(process.env.NODE_ENV === 'production') {
	app.set('trust proxy', 1);
	session.cookie.secure = true
}

app.use('/api/v1/user', require('./routes/user'))
app.use('/api/v1/admin_token', require('./routes/admin_token'))
app.use('/api/v1/category', require('./routes/category'))
app.use('/api/v1/thread', require('./routes/thread'))

sequelize
	.sync({ force: true })
	.then(() => {
		app.listen(config.port, () => {
			console.log('Listening on ' + config.port)

			app.locals.appStarted = true
			app.emit('appStarted')
		})
	})
	.catch((err) => {
		console.log(err)
	})

module.exports = app
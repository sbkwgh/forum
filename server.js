let express = require('express')
let app = express()

let sockets = require('./lib/sockets')

let sequelize = require('./models').sequelize

let config = require('./config/server.js')

//Middle-ware
let bodyParser = require('body-parser')
let morgan = require('morgan')
let expressSession = require('express-session')

let session = expressSession({
	secret: config.sessionSecret,
	resave: true,
	saveUninitialized: true
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session)

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
app.use('/api/v1/notification', require('./routes/notification'))
app.use('/api/v1/post', require('./routes/post'))
app.use('/api/v1/settings', require('./routes/settings'))
app.use('/api/v1/report', require('./routes/report'))
app.use('/api/v1/ban', require('./routes/ban'))

sequelize
	.sync({ force: true })
	.then(() => {
		let server = app.listen(config.port, () => {
			console.log('Listening on ' + config.port)

			app.locals.appStarted = true
			app.emit('appStarted')
		})

		sockets.init(app, server, session)
	})
	.catch((err) => {
		console.log(err)
	})

module.exports = app
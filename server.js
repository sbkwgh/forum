let express = require('express')
let app = express()

let { sequelize } = require('./models')
let sockets = require('./lib/sockets')

let config = require('./config/server.js')

//Middle-ware
let bodyParser = require('body-parser')
let expressSession = require('express-session')
let SequelizeStore = require('connect-session-sequelize')(expressSession.Store)
let compression = require('compression')
let helmet = require('helmet')

let path = require('path')


let session = expressSession({
	secret: config.sessionSecret,
	resave: true,
	saveUninitialized: true,
	store: new SequelizeStore({ db: sequelize })
})
if(process.env.NODE_ENV === 'production') {
	app.set('trust proxy', 1);
}

app.use(helmet())
app.use(compression())
app.use(bodyParser.json({ limit: '5mb' }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session)

if(process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
	app.use(require('morgan')('dev'))
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
app.use('/api/v1/search', require('./routes/search'))
app.use('/api/v1/log', require('./routes/log'))
app.use('/api/v1/poll', require('./routes/poll'))
app.use('/api/v1/link_preview', require('./routes/link_preview'))

app.use('/static', express.static(path.join(__dirname, 'frontend', 'dist')))
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'))
})

app.use(require('./lib/errorHandler'))

function main () {
	let server = app.listen(config.port, () => {
		console.log('Listening on ' + config.port)

		app.locals.appStarted = true
		app.emit('appStarted')
	})

	sockets.init(app, server, session)
}

if(process.env.NODE_ENV === 'test') {
	sequelize.sync({ force: true }).then(main)
} else {
	main()
}

module.exports = app
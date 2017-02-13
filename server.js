let express = require('express')
let app = express()

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

app.listen(config.port, () => {
	console.log('Listening on ' + config.port)
})

module.exports = app
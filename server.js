let express = require('express')
let app = express()

let config = require('./config.js')

//Middle-ware
let bodyParser = require('body-parser')
let morgan = require('morgan')

app.use(bodyParser.json())

if(process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
	app.use(morgan('dev'))
}

app.listen(config.port, () => {
	console.log('Listening on ' + config.port)
})

module.exports = app
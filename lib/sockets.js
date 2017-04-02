module.exports = {
	init (app, server) {
		let io = require('socket-io')(server)

		app.set('io', io)
	}
}
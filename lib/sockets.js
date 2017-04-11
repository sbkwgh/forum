module.exports = {
	init (app, server) {
		let io = require('socket.io')(server)

		io.on('connection', socket => {
			socket.on('join', room => {
				socket.join(room)
			})

			socket.on('leave', room => {
				socket.leave(room)
			})
		})

		app.set('io', io)
	}
}
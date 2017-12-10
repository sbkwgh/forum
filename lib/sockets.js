module.exports = {
	init (app, server, session) {
		let io = require('socket.io')(server)
		function setIoSockets (socket) {
			let users = app.get('io-users')

			if(socket.handshake.session.loggedIn) {
				users[socket.handshake.session.username] = socket.id
				app.set('io-users', users)
			}
		}

		app.set('io-users', {})

		io.use((socket, next) => {
			session(socket.handshake, {}, next)
		})

		io.on('connection', socket => {
			setIoSockets(socket)

			socket.on('join', room => {
				socket.join(room)
			})

			socket.on('leave', room => {
				socket.leave(room)
			})

			socket.on('accountEvent', _ => {
				socket.disconnect()
			})
		})

		app.set('io', io)
	}
}
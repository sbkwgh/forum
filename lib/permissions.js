let { User } = require('../models')

//`req` is the request object
//`permissions` is an array of strings:
//('loggedIn', 'admin', 'canCreatePosts', 'canCreateThreads',)
module.exports = async function (req, permissions) {
	try {
		//The return value - i.e. does the user have the
		//appropriate permissions
		let ret = true

		if(permissions.includes('loggedIn')) {
			ret = !!req.session.loggedIn
		}
		if(permissions.includes('admin')) {
			ret = !!req.session.admin
		}

		//`ret` to check if they are loggedIn/admin and so their account does exist
		if(
			( permissions.includes('canCreatePosts') || permissions.includes('canCreateThreads') )
			&& ret
		) {
			let user = await User.findOne({
				where: { username: req.session.username }
			})

			if(!user) return false

			if(permissions.includes('canCreatePosts')) {
				ret = user.canCreatePosts
			}
			if(permissions.includes('canCreateThreads')) {
				ret = user.canCreateThreads
			}
		}

		return ret
	} catch(e) {
		console.log(e)

		return false
	}
}
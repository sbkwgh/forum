module.exports = (sequelize, DataTypes) => {
	let Ip = sequelize.define('Ip', {
		ip: {
			type: DataTypes.STRING(45),
			validate: {
				isIP: true
			}
		}
	}, {
		classMethods: {
			associate (models) {
				Ip.belongsToMany(models.User, { through: 'UserIp' })
			},
			async createIfNotExists (ipAddress, user) {
				 let existingIp = await Ip.findOne({
				 	where: { ip: ipAddress },
				 	include: [{
				 		model: sequelize.models.User,
						where: { id: user.id }
				 	}]
				 })

				 if(!existingIp) {
				 	let ip = await Ip.create({ ip: ipAddress })
				 	await ip.addUser(user)
				 }
			}
		}
	})
	return Ip
}
let express = require('express')
let router = express.Router()

let randomBytes = require('crypto').randomBytes
let exec = require('child_process').exec
let fs = require('fs')

let { Sequelize, Backup } = require('../models')
const Errors = require('../lib/errors')
const Config = require('../config/config.json')

function promiseFromChildProcess(child) {
	return new Promise((resolve, reject) => {
		child.addListener('error', reject)
		child.addListener('exit', resolve)
	})
}


router.post('/', async (req, res) => {
	try {
		let dev = Config.development
		let id = randomBytes(12).toString('base64')
		let backupName = id + '-' + (new Date()).toISOString() + '.sql'

		let sha256 = await promiseFromChildProcess(exec(`
				mkdir ../backups -p
				&& mysqldump --lock-all-tables -u ${dev.username} -p${dev.password} ${dev.database} > ../backups/${backupName}
				&& openssl dgst -sha256 ../backups/${backupName}
		`))
		let size = fs.statsSync('../backups/' + backupName).size
		let backup = await Backup.create({ sha256, size })

		res.json(backup.toJSON())
	} catch (e) {
		console.log(e)
		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
})

module.exports = router
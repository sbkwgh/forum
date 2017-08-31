let express = require('express')
let router = express.Router()

let { PollAnswer, PollQuestion, User, Sequelize } = require('../models')
const Errors = require('../lib/errors')

router.all('*', (req, res, next) => {
	if(req.session.loggedIn) {
		next()
	} else {
		res.status(401)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	}
})

router.post('/', async (req, res) => {
	try {
		let answers = req.body.answers

		if(!answers || answers.length < 2) {
			throw Errors.sequelizeValidation(Sequelize, {
				error: 'You must provide at least 2 answers',
				value: answers
			})
		} else if(answers.length !== new Set(answers).size) {
			throw Errors.sequelizeValidation(Sequelize, {
				error: 'Answers cannot contain any duplicates',
				value: answers
			})
		}
		
		let user = await User.findById(req.session.UserId)
		let pollQuestion = await PollQuestion.create({ question: req.body.question })
		let pollAnswers = await Promise.all(
			answers.map(answer => {
				return PollAnswer.create({ answer })
			})
		)

		//Set associations
		await pollQuestion.setUser(user)
		await Promise.all(
			pollAnswers.map(pollAnswer => {
				return pollQuestion.addPollAnswer(pollAnswer)
			})
		)

		res.json(pollQuestion.toJSON())

	} catch (e) {
		if(e instanceof Sequelize.ValidationError) {
			res.status(400)
			res.json(e)
		} else {
			console.log(e)

			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

module.exports = router
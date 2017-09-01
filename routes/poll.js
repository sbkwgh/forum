let express = require('express')
let router = express.Router()

let { PollAnswer, PollQuestion, PollVote, User, Sequelize } = require('../models')
const Errors = require('../lib/errors')

router.get('/:id', async (req, res) => {
	try {
		let id = req.params.id
		let pollQuestion = await PollQuestion.findById(id, {
			include: [
				{ model: User, attributes: { exclude: ['hash'] } },
				{ model: PollAnswer, include: [PollVote] }
			]
		})
		if(!pollQuestion) throw Errors.sequelizeValidation(Sequelize, {
			error: 'invalid poll id',
			value: id
		})

		let totalVotes = pollQuestion.PollAnswers.reduce((sum, answer) => {
			return sum + answer.PollVotes.length
		}, 0)

		let answersWithPercent = pollQuestion.PollAnswers.map(answer => {
			let jsonAnswer = answer.toJSON()
			let percent = answer.PollVotes.length / totalVotes
			jsonAnswer.percent = Math.round(percent*100 * 10) / 10

			return jsonAnswer
		})

		let jsonPollQuestion = pollQuestion.toJSON()
		jsonPollQuestion.totalVotes = totalVotes
		jsonPollQuestion.PollAnswers = answersWithPercent

		res.json(jsonPollQuestion)
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

router.post('/:id', async (req, res) => {
	try {
		let previousVote = await PollVote.findOne({
			where: { PollQuestionId: req.params.id, UserId: req.session.UserId }
		})
		if(previousVote) throw Errors.sequelizeValidation(Sequelize, {
			error: 'you cannot vote twice',
			value: req.params.id
		})

		let poll = await PollQuestion.findById(req.params.id, {
			include: [PollAnswer]
		})
		if(!poll) throw Errors.sequelizeValidation(Sequelize, {
			error: 'invalid poll id',
			value: req.params.id
		})

		let pollAnswer = poll.PollAnswers.find(a => a.answer === req.body.answer)
		if(!pollAnswer) throw Errors.sequelizeValidation(Sequelize, {
			error: 'invalid answer',
			value: req.body.answer
		})

		let pollVote = await PollVote.create({ UserId: req.session.UserId })
		await pollVote.setPollQuestion(poll)
		await pollVote.setPollAnswer(pollAnswer)

		res.json(pollVote.toJSON())
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
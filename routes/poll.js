let express = require('express')
let router = express.Router()

let { PollAnswer, PollQuestion, PollVote, User, Sequelize, Thread } = require('../models')
const Errors = require('../lib/errors')

router.get('/:id', async (req, res, next) => {
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

		let hasVoted = await PollVote.findOne({
			where: {
				UserId: req.session.UserId,
				PollQuestionId: id
			}
		})

		let jsonPollQuestion = pollQuestion.toJSON()
		jsonPollQuestion.totalVotes = totalVotes
		jsonPollQuestion.PollAnswers = answersWithPercent
		jsonPollQuestion.hasVoted = !!hasVoted

		res.json(jsonPollQuestion)
	} catch (e) { next(e) }
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

router.post('/', async (req, res, next) => {
	try {
		let threadId = req.body.threadId
		let thread = await Thread.findById(req.body.threadId)
		if(!thread) {
			throw Errors.sequelizeValidation(Sequelize, {
				error: 'invalid thread id',
				value: threadId
			})
		} else if(thread.UserId !== req.session.UserId) {
			throw Errors.requestNotAuthorized
		} else if(thread.PollQuestionId) {
			throw Errors.sequelizeValidation(Sequelize, {
				error: 'invalid thread id',
				value: threadId
			})
		}

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
	
		let pollQuestion = await PollQuestion.create({
			UserId: req.session.UserId,
			question: req.body.question
		})
		let pollAnswers = await Promise.all(
			answers.map(answer => {
				return PollAnswer.create({ answer })
			})
		)

		//Set associations
		await thread.setPollQuestion(pollQuestion)
		await Promise.all(
			pollAnswers.map(pollAnswer => {
				return pollQuestion.addPollAnswer(pollAnswer)
			})
		)

		res.json(pollQuestion.toJSON())

	} catch (e) { next(e) }
})

router.post('/:id', async (req, res, next) => {
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

		res.redirect('/api/v1/poll/' + req.params.id)
	} catch (e) { next(e) }
})

module.exports = router
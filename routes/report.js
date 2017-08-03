let express = require('express')
let router = express.Router()

let { User, Post, Report } = require('../models')

router.all('*', (req, res) => {})
router.post('/', async (req, res) => {})

router.all('*', (req, res) => {})
router.get('/', async (req, res) => {})

module.exports = router
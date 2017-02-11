const Errors = {
	unknown: 'An unknown error occured on our end. Please try again later',
	missingParameter (param) {
		return `The request is missing the parameter "${param}"`
	}
}

for(var errorName in Errors) {
	var temp = {}
	temp.name = errorName
	temp.message = Errors[errorName]

	Errors[errorName] = temp
}

module.exports = Errors
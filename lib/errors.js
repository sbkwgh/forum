const Errors = {
	unknown: 'An unknown error occured on our end. Please try again later',
	accountAlreadyCreated: 'This account has already been created',
	missingParameter (param) {
		return `The request is missing the parameter "${param}"`
	},
	invalidParameterType (param, type) {
		return `Parameter "${param}" must be of type ${type}`
	},
	parameterLengthTooSmall (param, length) {
		return `Parameter "${param}" must be greater than ${length} characters in length`
	},
	parameterLengthTooLarge (param, length) {
		return `Parameter "${param}" must be less than ${length} characters in length`
	}
}

for(var errorName in Errors) {
	var temp = {}
	temp.name = errorName
	temp.message = Errors[errorName]

	Errors[errorName] = temp
}

Errors.VALIDATION_ERROR = 'VALIDATION_ERROR';

module.exports = Errors
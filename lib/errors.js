let Errors = {
	unknown: 'An unknown error occured on our end. Please try again later',
	accountAlreadyCreated: 'This account has already been created',
	categoryAlreadyExists: 'This category has already been created',
	invalidCategory: 'This category does not exist',
	invalidLoginCredentials: 'Invalid login credentials were provided',
	requestNotAuthorized: 'The request was not authorized',
	invalidToken: 'The token provided was not valid',
	invalidParameter (param, message) {
		if(message) {
			var punctuatedMessage = ': ' + message
		}

		return `Parameter "${param}" is invalid${punctuatedMessage}`
	},
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

let ProcessedErrors = {}
function processErrors(errorName) {
	let temp

	if(typeof Errors[errorName] === 'function') {
		temp = function() {
			let message = Errors[errorName](...arguments)
			return {
				name: errorName,
				message: message
			}
		}
	} else {
		temp = {}
		temp.name = errorName
		temp.message = Errors[errorName]
	}

	return temp
}

for(var errorName in Errors) {
	ProcessedErrors[errorName] = processErrors(errorName)
}

ProcessedErrors.VALIDATION_ERROR = 'VALIDATION_ERROR';

module.exports = ProcessedErrors
let Errors = {
	unknown: 'An unknown error occured on our end. Please try again later',
	accountAlreadyCreated: 'This account has already been created',
	categoryAlreadyExists: 'This category has already been created',
	accountDoesNotExist: 'This account does not exist',
	invalidCategory: 'This category does not exist',
	invalidLoginCredentials: 'Invalid login credentials were provided',
	requestNotAuthorized: 'The request was not authorized',
	invalidToken: 'The token provided was not valid',
	noSettings: 'You haven\'t added any settings yet',
	passwordSame: 'You can\'t set it to the same password',
	cannotLikeOwnPost: 'You can\'t like your own post',
	threadLocked: 'You can\'t post to a locked thread',
	invalidParameter (param, message) {
		if(message) {
			var punctuatedMessage = ': ' + message
		}

		return `${param} is invalid${punctuatedMessage}`
	},
	missingParameter (param) {
		return `Missing ${param}`
	},
	invalidParameterType (param, type) {
		return `${param} must be of type ${type}`
	},
	parameterLengthTooSmall (param, length) {
		return `${param} must be more than ${length} characters in length`
	},
	parameterLengthTooLarge (param, length) {
		return `${param} must be less than ${length} characters in length`
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
				message: message,
				parameter: arguments[0]
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
let Errors = {
	unknown: ['An unknown error occured on our end. Please try again later', 500],
	accountAlreadyCreated: ['This account has already been created', 400],
	categoryAlreadyExists: ['This category has already been created', 400],
	accountDoesNotExist: ['This account does not exist', 400],
	invalidCategory: ['This category does not exist', 400],
	invalidLoginCredentials: ['The username or password provided was incorrect', 401],
	requestNotAuthorized: ['The request was not authorized', 401],
	invalidToken: ['The token provided was not valid', 401],
	noSettings: ['You haven\'t added any settings yet', 500],
	passwordSame: ['You can\'t set it to the same password', 400],
	cannotLikeOwnPost: ['You can\'t like your own post', 400],
	threadLocked: ['You can\'t post to a locked thread', 400],
	postRemoved: ['You can\'t reply to a removed post', 400],
	invalidParameter (param, message) {
		if(message) {
			var punctuatedMessage = ': ' + message
		}

		return [`${param} is invalid${punctuatedMessage}`, 400]
	}
}

let ProcessedErrors = {}
function processErrors(errorName) {
	let temp

	if(typeof Errors[errorName] === 'function') {
		temp = function() {
			let arr = Errors[errorName](...arguments)
			return {
				name: errorName,
				message: arr[0],
				status: arr[1],
				parameter: arguments[0]
			}
		}
	} else {
		let arr = Errors[errorName]

		temp = {}
		temp.name = errorName
		temp.message = arr[0]
		temp.status = arr[1]
	}

	return temp
}

for(var errorName in Errors) {
	ProcessedErrors[errorName] = processErrors(errorName)
}

ProcessedErrors.VALIDATION_ERROR = 'VALIDATION_ERROR';

ProcessedErrors.sequelizeValidation = (sequelize, obj) => {
	return new sequelize.ValidationError(obj.error, [
		new sequelize.ValidationErrorItem(
			obj.error,
			'Validation error',
			obj.path,
			obj.value
		)
	])
}

module.exports = ProcessedErrors
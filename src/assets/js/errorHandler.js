module.exports = function(vuex) {
	return function (res, ignorePathErrorCb) {
		let errors = []

		if(res.response === undefined || res.response.data.errors === undefined) {
			errors.push('An error occured. Try again later')
		} else {
			res.response.data.errors.forEach(error => {
				let path = error.path

				if(path && ignorePathErrorCb) {
					ignorePathErrorCb(error, errors)
					return
				}
				errors.push(error.message)
			})
		}

		if(errors.length) {
			vuex.commit('setAjaxErrors', errors)
			vuex.commit('setAjaxErrorsModalState', true)
		}

	}
}
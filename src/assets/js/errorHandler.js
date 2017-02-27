module.exports = function(vuex) {
	return function (res, ignoreParamErrorCb) {
		let errors = []

		if(res.response === undefined) {
			errors.push('An error occured. Try again later')
		} else {
			res.response.data.errors.forEach(error => {
				let param = error.parameter

				if(param && ignoreParamErrorCb) {
					ignoreParamErrorCb(error, errors)
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
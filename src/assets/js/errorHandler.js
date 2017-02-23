module.exports = function(vuex) {
	return function (res, ignoreParamErrorCb) {
		let errors = []

		if(res.response === undefined) {
			errors.push('It looks like you\'re offline')
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

		vuex.commit('setAjaxErrors', errors)
		vuex.commit('setAjaxErrorsModalState', true)
	}
}
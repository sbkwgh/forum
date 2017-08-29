import axios from 'axios'

module.exports = function (route, resourceId) {
	//In which case resourceId is really the username
	if(route === 'userPosts' || route === 'userThreads') {
		axios
			.get('/api/v1/user/' + resourceId)
			.then(res => {
				return axios
					.post('/api/v1/log', {
						route,
						resourceId: res.data.id
					})
			})
			.catch(console.log)
	} else {
		axios
			.post('/api/v1/log', {
				route,
				resourceId
			})
			.catch(console.log)
	}


}
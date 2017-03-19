async function getNextId(Model, where, items) {
	try {
		let maxId = await Model.max('id', { where })
		let lastItem = items.slice(-1)[0]

		if(!lastItem || maxId === lastItem.id) {
			return null
		} else {
			return lastItem.id
		}
	} catch (e) {
		console.log(e)
		return null
	}
}

async function getPreviousId(Model, where, items, limit) {
	try {
		let minId = await Model.min('id', { where })
		let firstItem = items[0]

		if(!firstItem || minId === firstItem.id) {
			return null
		} else {
			return firstItem.id
		}
	} catch (e) {
		console.log(e)
		return null
	}
}


function getPaginationProps(query) {
	let lastId = 0
	let previousId = null
	let limit = 10

	if(+query.lastId > 0) lastId = +query.lastId
	if(+query.limit > 0) limit = +query.limit

	if(query.previousId) {
		lastId = null

		if(+query.previousId > 0) {
			previousId = +query.previousId
		} else {
			previousId = 0
		}
	}

	return { lastId, limit, previousId }
}

module.exports = {
	getNextId,
	getPreviousId,
	getPaginationProps
}
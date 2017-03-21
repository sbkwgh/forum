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
	let from = 0
	let limit = 10

	if(+query.from > 0) from = +query.from
	if(+query.limit > 0) limit = +query.limit

	if(+query.postNumber > 0) {
		let lowerFrom = +query.postNumber - Math.floor(limit / 2) + 1

		if(lowerFrom < 0) {
			from = 0
		} else {
			from = lowerFrom
		}
	}

	return { from, limit }
}

module.exports = {
	getNextId,
	getPreviousId,
	getPaginationProps
}
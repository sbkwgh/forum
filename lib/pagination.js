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

async function getNextIdDesc(Model, where, items) {
	try {
		let minId = await Model.min('id', { where })
		let lastItem = items.slice(-1)[0]

		if(!lastItem || minId === lastItem.id) {
			return null
		} else {
			return lastItem.id
		}
	} catch (e) {
		console.log(e)
		return null
	}
}


async function getNextCount (Model, items, limit, where) {
	let lastItem

	if(Array.isArray(items)) {
		lastItem = items.slice(-1)[0]
	} else {
		lastItem = items
	}

	where.id = { $gt: lastItem.id }

	let remaining = await Model.count({ where })

	if(remaining - limit < 0) {
		return remaining
	} else {
		return limit
	}
}

function getPaginationProps(query, desc) {
	let from = 0
	let limit = 10

	if(desc) {
		from = null
	}

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
	getNextIdDesc,
	getNextCount,
	getPaginationProps
}
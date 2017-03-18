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

		let lteVal

		if(firstItem.id - limit) {
			lteVal = firstItem.id - limit
		} else {
			minId
		}

		if(!firstItem || minId === firstItem.id) {
			return null
		} else {
			let instance = await Model.findOne({
				where: Object.assign({}, {
					id: {
						$lte: lteVal
					}
				}, where)
			})

			return instance.id
		}
	} catch (e) {
		console.log(e)
		return null
	}
}


function getPaginationProps(query) {
	let lastId = 0
	let limit = 10

	if(+query.lastId > 0) lastId = +query.lastId
	if(+query.limit > 0) limit = +query.limit

	return { lastId, limit }
}

module.exports = {
	getNextId,
	getPreviousId,
	getPaginationProps
}
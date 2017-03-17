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

function getPaginationProps(query) {
	let lastId = 0
	let limit = 10

	if(+query.lastId > 0) lastId = +query.lastId
	if(+query.limit > 0) limit = +query.limit

	return { lastId, limit }
}

module.exports = {
	getNextId,
	getPaginationProps
}
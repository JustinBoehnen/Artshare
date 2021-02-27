/** @format */

const sc = require('http-status-codes').StatusCodes
import { User } from '../../models/user.model'
import { PBN } from '../../models/pbn.model'

/**
 * Purpose: Search for PBNs with filter
 * Full path: /browser/search.json
 * req: tags: [string]
 *      max-colors: number
 *      min-colors: number
 *      username: string (name)
 *      name: string
 * res: token
 */
export async function post(req, res) {
	console.log(req.body)
	const query = PBN.find()
	var username = req.body.username || ''

	User.find({ username: { $regex: '.*' + username + '.*', $options: 'i' } }, '_id', (err, result) => {
		if (result) query.where('owner-id').equals(result)

		if (req.body.tags && req.body.tags.length > 0) query.where('tags').all(req.body.tags)

		if (req.body['min-colors']) query.where('num-colors').gte(req.body['min-colors'])

		if (req.body['max-colors']) query.where('num-colors').lte(req.body['max-colors'])

		if (req.body.name) query.where('name').regex(`(?i).*${req.body.name}.*`) //.equals(req.body.name)

		console.log(query._conditions)

		query.sort({ likes: 'desc' })
		query.select('name owner-name images likes dislikes num-colors tags')
		query.exec((err, docs) => {
			if (!err) {
				console.log(docs)
				res.status(sc.OK).send(docs)
			} else console.log(err)
		})
	})
}

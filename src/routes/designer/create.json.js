/** @format */

const sc = require('http-status-codes').StatusCodes
import { User } from '../../models/user.model'
import { PBN } from '../../models/pbn.model'

/**
 * Purpose: Adds a new PBN to the DB
 * Full path: /designer/create.json
 * req: username: String
 *      email:    String (unique)
 *      password: String
 *      created:  Date
 * res: token
 *
 * @format
 */

export async function post(req, res) {
	User.findById(req.body.owner, 'username', (err, user) => {
		if (!err && user != null) {
			var pbn = new PBN({
				name: req.body.name,
				'owner-id': req.body.owner,
				'owner-name': user.username,
				created: Date.now(),
				colors: req.body.colors,
				'num-colors': req.body.colors.length,
				tags: req.body.tags.map((t) => t.toLowerCase()),
				likes: 0,
				dislikes: 0,
				images: req.body.images,
			})

			pbn.save((err) => {
				if (!err) {
					User.findOneAndUpdate(
						{ _id: pbn.owner },
						{
							$push: { 'owned-pbns': pbn.id },
						},
						(err) => {
							if (err) console.log(err)
						}
					)
					res.sendStatus(sc.CREATED)
				} else {
					res.status(sc.NOT_MODIFIED).send(err.message)
					console.log(err)
				}
			})
		} else {
			console.log(err)
			res.sendStatus(sc.NOT_FOUND)
		}
	})
}

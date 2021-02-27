/** @format */

const sc = require('http-status-codes').StatusCodes
const bcrypt = require('bcrypt')
import { User } from '../../models/user.model'

/**
 * Purpose: Adds a new user to the DB
 * Full path: /auth/register.json
 * req: username: String (unique)
 *      email:    String (unique)
 *      password: String
 *      created:  Date
 * res: token
 */
export async function post(req, res) {
	bcrypt.hash(req.body.password, 10, (error, hash) => {
		if (!error) {
			var user = new User({
				username: req.body.username,
				email: req.body.email,
				password: hash,
				created: Date.now(),
				'ban-info': {
					banned: false,
					since: new Date(0),
					reason: '',
				},
			})

			user.save((err) => {
				if (!err) res.status(sc.OK).send(User.generateJwt(user))
				else {
					res.status(sc.CONFLICT).send(err.message)
					console.log(err)
				}
			})
		} else {
			res.status(sc.CONFLICT).send(['failed to hash password'])
		}
	})
}

/** @format */

const sc = require('http-status-codes').StatusCodes
const bcrypt = require('bcrypt')
import { json } from 'body-parser'
import { User } from '../../models/user.model'

/**
 * Purpose: Logs a user in
 * Full path: /auth/login.json
 * req: email:    String
 *      password: String
 * res: token
 */
export async function post(req, res) {
	User.findOne({ email: req.body.email }, (err, user) => {
		if (!err && user !== null) {
			bcrypt.compare(req.body.password, user.password, (err, result) => {
				if (result) res.status(sc.OK).send({ jwt: User.generateJwt(user) })
				else res.status(sc.UNAUTHORIZED).send('password does not match')
			})
		} else res.status(sc.NOT_FOUND).send('user not found')
	})
}

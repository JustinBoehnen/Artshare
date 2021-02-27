/** @format */

const sc = require('http-status-codes').StatusCodes
import { User } from '../../models/user.model'
import jwt from 'jsonwebtoken'

/**
 * Purpose: Updates the users token with a
 *          new token if they enter the site
 *          before the old one expires ((Default 1 week))
 * Full path: /auth/validate.json
 * req: old/current token
 * res: new token
 */
export async function post(req, res) {
	console.log('HEY GAMERS')
	jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			res.status(sc.UNAUTHORIZED).send('failed to verify token')
		} else if (Date.now() < decoded.exp * 1000) {
			User.findById(decoded.id, (err, user) => {
				if (!err && user != null) {
					res.status(sc.OK).send({ jwt: User.generateJwt(user) })
				} else {
					res.status(sc.NOT_FOUND).send('user not found')
				}
			})
		} else {
			res.status(sc.UNAUTHORIZED).send('token expired')
		}
	})
}

/** @format */

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

import { PBN } from './pbn.model'

mongoose.set('useCreateIndex', true)

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, 'username is required'],
		unique: true,
	},
	email: {
		type: String,
		required: [true, 'user email is required'],
		unique: true,
		validate: {
			validator: function (v) {
				return /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(v)
			},
			message: (email) => `${email.value} is an invalid email`,
		},
	},
	password: { type: String, required: [true, 'user password is required'] },
	'owned-pbns': [{ type: mongoose.Types.ObjectId, ref: 'PBN' }],
	created: { type: Date, required: [true, 'user creation (date) is required'] },
	'ban-info': {
		banned: Boolean,
		since: Date,
		reason: String,
	},
})

UserSchema.statics.generateJwt = (user) => {
	if (process.env.NODE_ENV !== 'test') {
		return jwt.sign(
			{
				id: user._id,
				username: user.username,
				email: user.email,
				created: user.created,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: process.env.JWT_EXP,
			}
		)
	} else {
		return
	}
}

// Removes PBNS
UserSchema.pre('remove', { document: true }, (next) => {
	PBN.remove({ _id: { $in: this['owned-pbns'] } })
	next()
})

export const User = mongoose.model('User', UserSchema)

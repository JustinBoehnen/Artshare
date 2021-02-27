/** @format */

const mongoose = require('mongoose')

var PBNSchema = new mongoose.Schema({
	name: { type: String, required: true },
	'owner-id': {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	'owner-name': { type: String, required: true },
	created: { type: Date, required: true },
	colors: {
		type: [
			{
				type: String,
				validate: {
					validator: function (c) {
						return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(c)
					},
					message: (color) =>
						`\'${color.value}\' at index ${color.path.replace('colors.', '')} is an invalid color`,
				},
			},
		],
		validate: {
			validator: function (arr) {
				return arr.length >= process.env.PBN_COLORS_MIN && arr.length <= process.env.PBN_COLORS_MAX
			},
			message: `colors array size requirements: [${process.env.PBN_COLORS_MIN} to ${process.env.PBN_COLORS_MAX}]`,
		},
		required: true,
	},
	'num-colors': { type: Number },
	tags: [{ type: String }],
	likes: Number,
	dislikes: Number,
	images: {
		thumbnail: { type: String, required: true },
		'full-size-colored': { type: String, required: true },
		'full-size-guides': { type: String, required: true },
		swatches: { type: String, required: true },
	},
})

export const PBN = mongoose.model('PBN', PBNSchema)

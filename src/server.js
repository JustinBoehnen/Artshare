/** @format */

import sirv from 'sirv'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
dotenvExpand(dotenv.config())
import express from 'express'
import compression from 'compression'
import bodyparser from 'body-parser'
import * as sapper from '@sapper/server'

const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'
express()
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		bodyparser.json({ limit: '100mb' }),
		bodyparser.urlencoded({ limit: '100mb' }),
		bodyparser.text({ limit: '100mb' }),
		sapper.middleware()
	)
	.listen(PORT, (err) => {
		if (err) console.log('error', err)
	})

mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})

mongoose.connection.on('connected', () => console.log('MongoDB Database connected!'))
mongoose.connection.on('error', (err) => console.log(`DB CONNECTION ERROR!\n${err}`))

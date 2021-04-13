/** @format */

const sc = require('http-status-codes').StatusCodes
const aws = require('aws-sdk')

const s3Bucket = new aws.S3({
	Bucket: 'artshare-image-library',
	region: 'us-west-2',
})

export async function post(req, res) {
	//const buf = Buffer.from(req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ''), 'base64')

	const key = `${req.body.key}_${Date.now()}`
	const image = Buffer.from(req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ''), 'base64')

	var data = {
		Bucket: 'artshare-image-library',
		Key: key,
		Body: image,
		ContentEncoding: 'base64',
		ContentType: 'image/png',
		ACL: 'public-read-write',
	}

	s3Bucket.putObject(data, (err, data) => {
		if (err) {
			console.log(err)
			res.sendStatus(sc.BAD_REQUEST)
			console.log('Error uploading data: ', data)
		} else {
			var url = { url: `https://artshare-image-library.s3-us-west-2.amazonaws.com/${key}` }
			res.status(sc.OK).send(JSON.stringify(url))
		}
	})
}

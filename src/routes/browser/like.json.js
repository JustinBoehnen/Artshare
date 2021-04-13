/** @format */

const sc = require('http-status-codes').StatusCodes
import { PBN } from '../../models/pbn.model'

/**
 * Purpose: Processes image for use as a PBN in Artshare
 * 			Can quantize, outline, and number images.
 * Full path: /designer/quantize.json
 * req: userid,
 *      pbnid
 * res: status
 *
 * @format
 */

export async function post(req, res) {
	PBN.findById(req.body.pbnid, (err, pbn) => {
		if (err) {
			res.sendStatus(sc.NOT_FOUND)
		} else {
			if (!pbn.likers.includes(req.body.userid)) {
				//user has not liked pbn
				PBN.findByIdAndUpdate(req.body.pbnid, {
					$inc: { likes: 1 },
					$push: { likers: req.body.userid },
				})
					.exec()
					.then(() => {
						if (pbn.dislikers.includes(req.body.userid)) {
							//user disliked pbn in past
							PBN.findByIdAndUpdate(req.body.pbnid, {
								$inc: { dislikes: -1 },
								$pull: { dislikers: req.body.userid },
							})
								.exec()
								.then(() => {
									res.sendStatus(sc.OK)
								})
						} else res.sendStatus(sc.OK)
					})
			} else res.sendStatus(sc.NOT_MODIFIED)
		}
	})
}

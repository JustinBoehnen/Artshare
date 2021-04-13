/** @format */

const sc = require('http-status-codes').StatusCodes
import { createCanvas } from 'canvas'

/**
 * Purpose: Processes image for use as a PBN in Artshare
 * 			Can quantize, outline, and number images.
 * Full path: /designer/quantize.json
 * req: quantize_args: {
 * 			image_src:			Base64 src,
 * 			palette: 			[[r,g,b]...],
 * 			blur_radius:		Number,		//must be non-zero, image complexity
 * 			cleanup_iterations:	Number,		//larger is slower but results in smoother edges
 * 			cleanup_radius:		Number		//must be non-zero, intensity of cleanup iterations
 * 		},
 * 		number_args: {
 * 			use_numbers:		Boolean,
 * 			cell_size:			Number, 	//larger is faster but has less accurate number placement
 * 			region_threshold:	Number, 	//don't number regions that are composed of less that this many cells
 * 			font_color:			[r,g,b],	
 * 			font_size:			Number
 * 		},
 * 		outline_args: {
 *			use_outlines:		Boolean,
			line_thickness:		Number,
			line_color:			[r,g,b],
			use_bg:				Boolean,	//will put a solid background behind outlines and numbers
			bg_color:			[r,g,b]
 * 		}
 * res: image source (PNG)
 *
 * @format
 */

export async function post(req, res) {
	const palette = req.body.palette

	const paper_width = 8.5
	const paper_height = 11
	const width = paper_width * 300
	const height = paper_height * 300
	const columns = 4
	const page_horizontal_margin = 300
	const page_vertical_margin = 150
	const page_vertical_divider = 20
	const page_horizontal_divider = 50
	const swatch_container_width =
		(width - (page_horizontal_margin * 2 + page_horizontal_divider * (columns - 1))) / columns
	const swatch_container_height =
		(height - (page_vertical_margin * 2 + page_vertical_divider * Math.ceil(100 / columns))) /
		Math.ceil(100 / columns)
	const text_size = swatch_container_height
	const text_max_width = text_size * 1.75
	const swatch_height = swatch_container_height
	const swatch_width = swatch_container_width - text_max_width

	var canvas = createCanvas(width, height)
	var ctx = canvas.getContext('2d')

	ctx.textAlign = 'right'
	ctx.font = `${text_size}px Times New Roman`
	ctx.textBaseline = 'top'

	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, width, height)

	palette.forEach((color, i) => {
		var col = i % columns
		var row = Math.floor(i / columns)

		var x = page_horizontal_margin + page_horizontal_divider * col + swatch_container_width * col,
			y = page_vertical_margin + page_vertical_divider * row + swatch_container_height * row

		ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`
		ctx.fillRect(x, y, swatch_width, swatch_height)
		ctx.fillStyle = 'black'
		ctx.fillText(i + 1, x + swatch_container_width, y, text_max_width)
	})

	const str = canvas.toDataURL('image/png')
	const im = str.split(',')[1]
	const img = Buffer.from(im, 'base64')

	res.writeHead(sc.OK, { 'Content-Type': 'image/png', 'Content-Length': img.length })
	res.end(img)
}

/** @format */

const sc = require('http-status-codes').StatusCodes
import * as StackBlur from 'stackblur-canvas'
import { createCanvas, loadImage } from 'canvas'
import { xlink_attr } from 'svelte/internal'

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

async function convertHTMLToData(image_html) {
	return new Promise((resolve) => {
		var canvas = createCanvas(image_html.width, image_html.height)
		var ctx = canvas.getContext('2d')

		ctx.drawImage(image_html, 0, 0)
		var imageData = ctx.getImageData(0, 0, image_html.width, image_html.height)

		resolve(imageData)
	})
}

function convertDataToSrc(image_data) {
	var canvas = createCanvas(image_data.width, image_data.height)
	var ctx = canvas.getContext('2d')

	ctx.putImageData(image_data, 0, 0)
	return canvas.toDataURL('image/png')
}

function get3dDistance(c1, c2) {
	var r = (c1[0] - c2[0]) * (c1[0] - c2[0])
	var g = (c1[1] - c2[1]) * (c1[1] - c2[1])
	var b = (c1[2] - c2[2]) * (c1[2] - c2[2])
	return Math.sqrt(r + g + b)
}

function findClosestPaletteEntry(color, palette) {
	var dist
	var lowestDist = Infinity
	var indexOfLowest

	palette.forEach((c, i) => {
		dist = get3dDistance(color, c)

		if (dist < lowestDist) {
			lowestDist = dist
			indexOfLowest = i
		}
	})

	return palette[indexOfLowest]
}

export async function post(req, res) {
	const image_html = await loadImage(req.body.quantize_args.image_src)
	const palette = req.body.quantize_args.palette
	const blur_radius = req.body.quantize_args.blur_radius
	const cleanup_iterations = req.body.quantize_args.cleanup_iterations
	const cleanup_radius = req.body.quantize_args.cleanup_radius

	const use_numbers = req.body.number_args.use_numbers
	const cell_size = req.body.number_args.cell_size
	const region_threshold = req.body.number_args.region_threshold
	const font_color = req.body.number_args.font_color
	const font_size = req.body.number_args.font_size

	const use_outlines = req.body.outline_args.use_outlines
	const line_thickness = req.body.outline_args.line_thickness
	const line_color = req.body.outline_args.line_color
	const use_bg = req.body.outline_args.use_bg
	const bg_color = req.body.outline_args.bg_color

	const image_data = await convertHTMLToData(image_html)
	StackBlur.imageDataRGBA(image_data, 0, 0, image_data.width, image_data.height, blur_radius)

	for (var y = 0; y < image_data.height; y++) {
		for (var x = 0; x < image_data.width; x++) {
			var i = (y * image_data.width + x) * 4
			var iColor = [image_data.data[i], image_data.data[i + 1], image_data.data[i + 2]]

			var closestColor = findClosestPaletteEntry(iColor, palette)

			image_data.data[i] = closestColor[0]
			image_data.data[i + 1] = closestColor[1]
			image_data.data[i + 2] = closestColor[2]
			image_data.data[i + 3] = 255
		}
	}

	for (var i = 0; i < cleanup_iterations; i++) {
		StackBlur.imageDataRGBA(image_data, 0, 0, image_data.width, image_data.height, cleanup_radius)

		for (var y = 0; y < image_data.height; y++) {
			for (var x = 0; x < image_data.width; x++) {
				var i = (y * image_data.width + x) * 4
				var iColor = [image_data.data[i], image_data.data[i + 1], image_data.data[i + 2]]

				var closestColor = findClosestPaletteEntry(iColor, palette)

				image_data.data[i] = closestColor[0]
				image_data.data[i + 1] = closestColor[1]
				image_data.data[i + 2] = closestColor[2]
				image_data.data[i + 3] = 255
			}
		}
	}

	const outlines = use_outlines
		? await addOutlines(image_data, line_thickness, line_color, use_bg, bg_color)
		: image_data

	const numbers = use_numbers
		? await addNumbers(image_data, outlines, cell_size, palette, region_threshold, font_color, font_size)
		: outlines

	const str = convertDataToSrc(numbers)
	const im = str.split(',')[1]
	const img = Buffer.from(im, 'base64')

	res.writeHead(sc.OK, { 'Content-Type': 'image/png', 'Content-Length': img.length })
	res.end(img)
}

async function addNumbers(imageData, imageOutlines, cell_size, palette, region_threshold, font_color, font_size) {
	var canvas = createCanvas(imageData.width, imageData.height)
	var ctx = canvas.getContext('2d')

	ctx.putImageData(imageOutlines, 0, 0)

	var data = []

	for (var y = 0; y < imageData.height; y += cell_size) {
		data[y / cell_size] = []
		var y_adj = y + Math.round(cell_size / 2)
		y_adj = y_adj > imageData.height ? y : y_adj

		for (var x = 0; x < imageData.width; x += cell_size) {
			var x_adj = x + Math.round(cell_size / 2)
			x_adj = x_adj > imageData.width ? x : x_adj

			//index for color sampling
			var i = (y_adj * imageData.width + x_adj) * 4

			var color = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]
			var cell = { x, y, color, visited: false }
			data[y / cell_size].push(cell)
		}
	}

	const getSpaceAround = (x, y, color) => {
		const x_adj = x / cell_size
		const y_adj = y / cell_size
		var top = y_adj,
			bottom = y_adj,
			left = x_adj,
			right = x_adj

		while (data[y_adj]?.[left] != undefined && isSameColor(color, data[y_adj][left].color)) {
			left--
		}
		while (data[y_adj]?.[right] != undefined && isSameColor(color, data[y_adj][right].color)) {
			right++
		}
		while (data[top]?.[x_adj] != undefined && isSameColor(color, data[top][x_adj].color)) {
			top--
		}
		while (data[bottom]?.[x_adj] != undefined && isSameColor(color, data[bottom][x_adj].color)) {
			bottom++
		}

		left = x_adj - left
		right = right - x_adj
		top = y_adj - top
		bottom = bottom - y_adj

		return Math.min(top, bottom, left, right)
	}

	const isSameColor = (a, b) => {
		return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
	}

	const getPalleteIndex = (color) => {
		var ret = -1
		palette.forEach((pcol, i) => {
			if (isSameColor(color, pcol)) {
				ret = i
			}
		})
		return ret
	}

	/* CALCULATE REGIONS */
	var regions = []
	var region_queue = []
	var process_queue = []

	const processCell = async (coor, r) => {
		const cell = data[coor.y][coor.x]
		var x, y

		if (!cell.visited) {
			//left neighbor
			x = coor.x - 1
			y = coor.y
			if (data[y]?.[x] != undefined) {
				if (!data[y][x].visited)
					if (isSameColor(cell.color, data[y][x].color)) region_queue.push({ x, y })
					else process_queue.push({ x, y })
			}

			//right neighbor
			x = coor.x + 1
			y = coor.y
			if (data[y]?.[x] != undefined) {
				if (!data[y][x].visited)
					if (isSameColor(cell.color, data[y][x].color)) region_queue.push({ x, y })
					else process_queue.push({ x, y })
			}

			//top neighbor
			x = coor.x
			y = coor.y - 1
			if (data[y]?.[x] != undefined) {
				if (!data[y][x].visited)
					if (isSameColor(cell.color, data[y][x].color)) region_queue.push({ x, y })
					else process_queue.push({ x, y })
			}

			//bottom neighbor
			x = coor.x
			y = coor.y + 1
			if (data[y]?.[x] != undefined) {
				if (!data[y][x].visited)
					if (isSameColor(cell.color, data[y][x].color)) region_queue.push({ x, y })
					else process_queue.push({ x, y })
			}

			regions[r].push(cell)
			cell.visited = true
		}
	}

	var r
	var curr_cell
	var rqlen
	process_queue.push({ x: 0, y: 0 })

	while (process_queue.length > 0) {
		if (process_queue[0].visited) {
			process_queue.splice(0, 1)
		} else {
			//get new color cell and remove from queue
			curr_cell = process_queue[0]
			process_queue.splice(0, 1)

			//new region
			r = regions.length
			regions.push([])

			do {
				//process cell and direct neighbors
				await processCell(curr_cell, r)

				rqlen = region_queue.length

				//get neighbor cell of same color and remove from queue
				if (rqlen > 0) {
					curr_cell = region_queue[0]
					region_queue.splice(0, 1)
				}
			} while (rqlen > 0)
		}
	}

	/* ///////////////// */
	/* THRESHOLD REGION SIZE */
	var regions_thresholded = []
	regions.forEach((region) => {
		if (region.length >= region_threshold) regions_thresholded.push(region)
	})
	/* ///////////////// */

	/* CALCULATE REGION CENTERS */
	var region_centers = []
	regions_thresholded.forEach((region) => {
		var x = 0
		var y = 0
		var largest_area = 0

		region.forEach((cell) => {
			var space = getSpaceAround(cell.x, cell.y, cell.color)
			if (space > largest_area) {
				largest_area = space
				x = cell.x
				y = cell.y
			}
		})

		region_centers.push({ x, y })
	})
	/* ///////////////// */

	/* DRAW PALETTE NUMBERS */

	ctx.font = `${font_size}px Times New Roman`
	ctx.fillStyle = font_color ? `rgb(${font_color[0]},${font_color[1]},${font_color[2]})` : 'black'
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'

	regions_thresholded.forEach((region, i) => {
		ctx.fillText(
			(getPalleteIndex(region[0].color) + 1).toString(),
			region_centers[i].x + cell_size / 2,
			region_centers[i].y + cell_size / 2
		)
	})
	/* ///////////////// */

	return ctx.getImageData(0, 0, imageData.width, imageData.height)
}

async function addOutlines(imageData, line_thickness, line_color, use_bg, bg_color) {
	var canvas = createCanvas(imageData.width, imageData.height)
	var ctx = canvas.getContext('2d')

	ctx.putImageData(imageData, 0, 0)

	const isSameColor = (a, b) => {
		return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
	}

	if (use_bg) {
		ctx.fillStyle = `rgb(${bg_color[0]},${bg_color[1]},${bg_color[2]})`
		ctx.fillRect(0, 0, imageData.width, imageData.height)
	}

	ctx.fillStyle = `rgb(${line_color[0]},${line_color[1]},${line_color[2]})`

	for (var y = 0; y < imageData.height; y++) {
		for (var x = 0; x < imageData.width; x++) {
			var i = (y * imageData.width + x) * 4
			//if not rightmost col or bottommost row
			if (y < imageData.height - 1 && x < imageData.width - 1) {
				var curr = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]
				var bottom = [
					imageData.data[i + imageData.width * 4], //r
					imageData.data[i + imageData.width * 4 + 1], //g
					imageData.data[i + imageData.width * 4 + 2], //b
				]
				var right = [imageData.data[i + 4], imageData.data[i + 5], imageData.data[i + 6]]

				//if right or bottom neighbor is diff color
				if (!isSameColor(curr, bottom) || !isSameColor(curr, right)) {
					//draw box of line_thickness
					ctx.rect(
						x - Math.floor(line_thickness / 2),
						y - Math.floor(line_thickness / 2),
						line_thickness,
						line_thickness
					)
				}
			}
		}
	}

	ctx.fill()

	return ctx.getImageData(0, 0, imageData.width, imageData.height)
}

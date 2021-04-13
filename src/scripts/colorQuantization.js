/** @format */
/*Justin Boehnen 2021*/
import * as StackBlur from 'stackblur-canvas'

export function getImageData(file, smoothing_radius = 5) {
	return new Promise((resolve) => {
		var canvas = document.createElement('canvas')
		var ctx = canvas.getContext('2d')

		var reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = (e) => {
			var image = new Image()
			image.src = e.target.result

			image.onload = () => {
				canvas.height = image.height
				canvas.width = image.width

				ctx.drawImage(image, 0, 0)
				var imageData = ctx.getImageData(0, 0, image.width, image.height)

				StackBlur.imageDataRGBA(imageData, 0, 0, image.width, image.height, smoothing_radius)

				resolve(imageData)
			}
		}
	})
}

function convertHTMLToData(image_html) {
	return new Promise((resolve) => {
		var canvas = document.createElement('canvas')
		var ctx = canvas.getContext('2d')

		canvas.height = image_html.height
		canvas.width = image_html.width

		ctx.drawImage(image_html, 0, 0)
		var imageData = ctx.getImageData(0, 0, image_html.width, image_html.height)

		//console.log('converting html to data: ', imageData)
		resolve(imageData)
	})
}

function convertDataToHTML(image_data) {
	return new Promise((resolve) => {
		var canvas = document.createElement('canvas')
		var ctx = canvas.getContext('2d')

		var image = new Image()

		//image.onload = () => {
		canvas.height = image_data.height
		canvas.width = image_data.width

		ctx.putImageData(image_data, 0, 0)
		image.src = canvas.toDataURL()

		//console.log('converting data to html: ', image)
		resolve(image)
		//}
	})
}

export function getImageHTMLFromFile(file) {
	return new Promise((resolve) => {
		var reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = (e) => {
			var image = new Image()
			image.src = e.target.result

			image.onload = () => {
				resolve(image)
			}
		}
	})
}

export function cropImage(image_html, x, y, width, height) {
	return new Promise((resolve) => {
		var canvas = document.createElement('canvas')
		var ctx = canvas.getContext('2d')
		const img = new Image()

		//img.onload = () => {
		canvas.height = height
		canvas.width = width

		ctx.drawImage(image_html, -x, -y)
		img.src = canvas.toDataURL()

		resolve(img)
		//}
	})
}

export function quantizeImage(image_html, palette, blur_radius, cleanup_iterations = 0, cleanup_radius = 5) {
	return new Promise((resolve) => {
		convertHTMLToData(image_html).then((image_data) => {
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

			convertDataToHTML(image_data).then((html) => {
				resolve(html)
			})
		})
	})
}

export function outlineImage(
	image_html,
	make_white = true,
	line_thickness = 2,
	line_color = [0, 0, 0],
	white_color = [255, 255, 255]
) {
	return new Promise((resolve) => {
		convertHTMLToData(image_html).then((image) => {
			var canvas = document.createElement('canvas')
			var ctx = canvas.getContext('2d')

			canvas.height = image.height
			canvas.width = image.width
			ctx.putImageData(image, 0, 0)

			if (make_white) {
				ctx.fillStyle = `rgb(${white_color[0]},${white_color[1]},${white_color[2]})`
				ctx.fillRect(0, 0, image.width, image.height)
			}

			ctx.fillStyle = `rgb(${line_color[0]},${line_color[1]},${line_color[2]})`

			for (var y = 0; y < image.height; y++) {
				for (var x = 0; x < image.width; x++) {
					var i = (y * image.width + x) * 4
					//if not rightmost col or bottommost row
					if (y < image.height - 1 && x < image.width - 1) {
						var curr = [image.data[i], image.data[i + 1], image.data[i + 2]]
						var bottom = [
							image.data[i + image.width * 4], //r
							image.data[i + image.width * 4 + 1], //g
							image.data[i + image.width * 4 + 2], //b
						]
						var right = [image.data[i + 4], image.data[i + 5], image.data[i + 6]]

						//if right or bottom neighbor is diff color
						if (compareColors(curr, bottom) == false || compareColors(curr, right) == false) {
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

			const imageData = ctx.getImageData(0, 0, image.width, image.height)

			convertDataToHTML(imageData).then((html) => {
				resolve(html)
			})
		})
	})
}

export function addNumbers(image_html, palette) {
	return new Promise((resolve) => {
		convertHTMLToData(image_html).then((image) => {
			var canvas = document.createElement('canvas')
			var ctx = canvas.getContext('2d')

			canvas.height = image.height
			canvas.width = image.width
			ctx.putImageData(image, 0, 0)

			//pixelate image
			const cell_size = 5
			var data = []

			//pixelate then populate data array with every cell
			for (var y = 0; y < image.height; y += cell_size) {
				data[y / cell_size] = []
				var y_adj = y + Math.round(cell_size / 2)
				y_adj = y_adj > image.height ? y : y_adj

				for (var x = 0; x < image.width; x += cell_size) {
					var x_adj = x + Math.round(cell_size / 2)
					x_adj = x_adj > image.width ? x : x_adj

					//index for color sampling
					var i = (y_adj * image.width + x_adj) * 4

					var color = [image.data[i], image.data[i + 1], image.data[i + 2]]
					var cell = { x, y, color, visited: false }
					data[y / cell_size].push(cell)
				}
			}

			console.log(data)

			//populate data array with every cell
			/*for (var y = 0; y < image.height; y++) {
				for (var x = 0; x < image.width; x++) {
					var i = (y * image.width + x) * 4
					var color = [image.data[i], image.data[i + 1], image.data[i + 2]]
					var cell = { x, y, color, visited: false }
					data.push(cell)
				}
			}*/

			var regions = []
			var stack_size = 0
			var queue = []

			const isSameColor = (a, b) => {
				return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
			}

			const groupCells = (x, y, r) => {
				//console.log(stack_size)

				if (data[y][x].visited === false) {
					data[y][x].visited = true
					if (regions[r] === undefined) regions[r] = []

					//console.log(stack_size)

					//up
					if (y - 1 > 0) {
						stack_size++

						if (isSameColor(data[y][x].color, data[y - 1][x].color)) {
							setTimeout(() => {
								groupCells(x, y - 1, r)
							}, 0)
						} else queue.push({ x, y: y - 1 })

						stack_size--
					}

					//down
					if (y + 1 < data.length) {
						stack_size++

						if (isSameColor(data[y][x].color, data[y + 1][x].color)) {
							setTimeout(() => {
								groupCells(x, y + 1, r)
							}, 0)
						} else queue.push({ x, y: y + 1 })

						stack_size--
					}

					//left
					if (x - 1 > 0) {
						stack_size++

						if (isSameColor(data[y][x].color, data[y][x - 1].color)) {
							setTimeout(() => {
								groupCells(x - 1, y, r)
							}, 0)
						} else queue.push({ x: x - 1, y })

						stack_size--
					}

					//right
					if (x + 1 < data[0].length) {
						stack_size++

						if (isSameColor(data[y][x].color, data[y][x + 1].color)) {
							setTimeout(() => {
								groupCells(x + 1, y, r)
							}, 0)
						} else queue.push({ x: x + 1, y })

						stack_size--
					}

					regions[r].push(data[y][x])
				}
			}

			ctx.font = `${cell_size}px serif`
			//ctx.fillStyle = 'red'

			// initial pass

			try {
				groupCells(0, 0, 0)
			} catch (error) {
				console.log(error)
				console.log(stack_size)
			}

			console.log(queue)

			// remaining passes
			try {
				while (queue.length > 0) {
					setTimeout(() => {}, 1000)
					var cell = queue[0]
					queue.splice(0, 1)
					groupCells(cell.x, cell.y, regions.length)
				}
			} catch (error) {
				console.log(error)
				console.log(stack_size)
			}

			console.log(regions)

			regions.forEach((region, i) => {
				var rand = [
					Math.floor(Math.random() * 256),
					Math.floor(Math.random() * 256),
					Math.floor(Math.random() * 256),
				]
				ctx.fillStyle = `rgb(${rand[0]},${rand[1]},${rand[2]})`
				region.forEach((cell) => {
					ctx.fillRect(cell.x, cell.y, cell_size, cell_size)
					//ctx.fillText(`${i}`, cell.x, cell.y, cell_size)
				})
			})

			const imageData = ctx.getImageData(0, 0, image.width, image.height)

			convertDataToHTML(imageData).then((html) => {
				resolve(html)
			})
		})
	})
}

/*export function addNumbers(image_html, palette, number_color, cell_size) {
	const colorMatch = (r, g, b, color) => r == color[0] && g == color[1] && b == color[2]

	return new Promise((resolve) => {
		convertHTMLToData(image_html).then((image) => {
			var canvas = document.createElement('canvas')
			var ctx = canvas.getContext('2d')

			canvas.height = image.height
			canvas.width = image.width
			ctx.putImageData(image, 0, 0)

			ctx.font = `${cell_size}px serif`
			//ctx.fillStyle = `rgb(${number_color[0]},${number_color[1]},${number_color[2]})`

			var cells = []

			//populate cells
			for (var y = 0; y < image.height; y += cell_size) {
				var y_adj = y / cell_size
				cells[y_adj] = []
				for (var x = 0; x < image.width; x += cell_size) {
					var i = ((y + Math.floor(cell_size / 2)) * image.width + (x + Math.floor(cell_size / 2))) * 4
					var x_adj = x / cell_size
					if (x + Math.floor(cell_size / 2) < image.width && y + Math.floor(cell_size / 2) < image.width) {
						palette.forEach((color, j) => {
							if (colorMatch(image.data[i], image.data[i + 1], image.data[i + 2], color)) {
								cells[y_adj][x_adj] = j
							}
						})
					}
				}
			}

			cells.forEach((rows, y) => {
				rows.forEach((cell, x) => {
					ctx.fillStyle = `rgb(${palette[cell][0]},${palette[cell][1]},${palette[cell][2]})`
					ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size)
					//ctx.fillText(`${cell}`, x * cell_size, y * cell_size, cell_size)
				})
			})

			console.log(cells)

			//ctx.fill()

			const imageData = ctx.getImageData(0, 0, image.width, image.height)

			convertDataToHTML(imageData).then((html) => {
				resolve(html)
			})
		})
	})
}*/

/*export function addNumbers(image_html, palette, number_color, number_size) {
	const colorMatch = (r, g, b, color) => r == color[0] && g == color[1] && b == color[2]

	return new Promise((resolve) => {
		convertHTMLToData(image_html).then((image) => {
			var canvas = document.createElement('canvas')
			var ctx = canvas.getContext('2d')

			canvas.height = image.height
			canvas.width = image.width
			ctx.putImageData(image, 0, 0)

			ctx.font = `${number_size}px serif`
			ctx.fillStyle = `rgb(${number_color[0]},${number_color[1]},${number_color[2]})`

			for (var y = 0; y < image.height; y++) {
				for (var x = 0; x < image.width; x++) {
					var i = (y * image.width + x) * 4

					if (y % 20 == 0 && x % 20 == 0) {
						palette.forEach((color, j) => {
							if (colorMatch(image.data[i], image.data[i + 1], image.data[i + 2], color)) {
								ctx.fillText(`${j + 1}`, x, y)
							}
						})
					}
				}
			}

			//ctx.fill()

			const imageData = ctx.getImageData(0, 0, image.width, image.height)

			convertDataToHTML(imageData).then((html) => {
				resolve(html)
			})
		})
	})
}*/

function compareColors(c1, c2) {
	if (c1[0] != c2[0]) return false
	if (c1[1] != c2[1]) return false
	if (c1[2] != c2[2]) return false

	return true
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

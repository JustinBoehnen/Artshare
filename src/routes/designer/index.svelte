<svelte:head>
	<title>Create</title>
</svelte:head>

<script>
	
	import { onMount } from 'svelte';
	import { navHeight } from '../../stores/position-store'
	import { user } from '../../stores/auth-store'
	import Upload from "./upload.svelte"
	import Crop from "./crop.svelte"
	import Color from "./color.svelte"
	import Create from './create.svelte'

	var current_step = 0
	const step_titles = [
		"Step 1: Upload",
		"Step 2: Crop",
		"Step 3: Color",
		"Step 4: Create"
	]
	var loading = false
	var markers
	var step_info = {
		markers,
		highest_completed: -1,
	}
	let pbn_name
	let pbn_tags = []
	let color_palette
	let uploaded_image
	let cropped_image
	let published = false

	var quantized_image
	var outlined_image
	var swatch_image

	onMount(() => {
		step_info.markers = [
			document.getElementById("marker0"),
			document.getElementById("marker1"),
			document.getElementById("marker2"),
			document.getElementById("marker3")
		]

		refreshMarkerAppearance()
	})

	const uploadImages = (image_src, key) => {
        return new Promise((resolve) => {
			const body = {
				key: key,
				imageBinary: image_src
			}

            fetch(`http://localhost:3000/designer/uploadimage.json`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(response => {
				response.json().then(json=>{
					resolve(json.url)
				})
            })
        })
	}

	const convertColors = (colors) => {
		var newColors = []

		const componentToHex = (c)=> {
			var hex = c.toString(16);
  			return hex.length == 1 ? "0" + hex : hex;
		}

		const rgbToHex = (r,g,b) => {
			return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
		}

		colors.forEach(color => {
			newColors.push(rgbToHex(color[0], color[1], color[2]))
		});

		return newColors
	}

	const createPBN = (name, tags, colors, owner, username, image_full, image_outlines, image_swatches) => {
        return new Promise((resolve) => {
			const body = {
				name, tags, colors, owner, username, images:{
					thumbnail: image_full,
					"full-size-colored": image_full,
					"full-size-guides": image_outlines,
					swatches: image_swatches
				}
			}

			console.log(body)

            fetch(`http://localhost:3000/designer/create.json`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(response => {
				resolve(response.status)
            })
        })
	}

	const handleMarkerClick = (from) => {
		if(from <= step_info.highest_completed + 1){
			current_step = from
			refreshMarkerAppearance()
		}
	}

	const refreshMarkerAppearance = () => {
		step_info.markers.forEach((marker, i) => {
			if(i == current_step){
				marker.style["background-color"] = "#fff"
			}
			else if(i <= step_info.highest_completed + 1){
				marker.style["background-color"] = "#276678"
			}
			else{
				marker.style["background-color"] = "#bbb"
			}
		})
	}

	const handleImageSubmit = e => {
		uploaded_image = e.detail.img_html
		//pbn_name = e.detail.name
		//pbn_tags = e.detail.tags
		color_palette = []
		step_info.highest_completed = 0
		current_step = 1
		refreshMarkerAppearance()
	}

	const handleCropSubmit = e => {
		cropped_image = e.detail.img_html
		step_info.highest_completed = 1
		current_step = 2
		refreshMarkerAppearance()
	}

	const handleColorSubmit = e => {
		published = false
		color_palette = e.detail.palette
		step_info.highest_completed = 2
		current_step = 3
		refreshMarkerAppearance()
	}

	const handleCreateSubmit = e => {
		console.log(e.detail)
		pbn_name = e.detail.name
		pbn_tags = e.detail.tags

	 	uploadImages(e.detail.quantized_image, `${pbn_name}_Full`).then(url => {
		 	quantized_image = url
			
			uploadImages(e.detail.outlined_image, `${pbn_name}_Outlined`).then(url => {
		 		outlined_image = url
			 
				uploadImages(e.detail.swatch_image, `${pbn_name}_Swatches`).then(url => {
					swatch_image = url

					createPBN(pbn_name, pbn_tags, convertColors(color_palette), $user.id, $user.username, quantized_image, outlined_image, swatch_image).then(status => {
						if(status == 200){
							published = true
						}
					})
	 			})
	 		})
	 	})
	}

	const loadingOn = () => {
		loading = true
	}
	const loadingOff = () => {
		loading = false
	}
</script>

<div class="container">
	{#if loading}
		<div class="loading-pane" style="top: -{$navHeight}px;"/>
	{/if}
	<div class="step-header">
		<div class="step-tracker">
			<div on:click={() => handleMarkerClick(0)} class="step-marker">
				<div class="step-number" id="marker0">1</div>
				<div class="step-name">upload</div>
			</div>
			<div on:click={() => handleMarkerClick(1)} class="step-marker">
			<div class="step-number" id="marker1">2</div>
				<div class="step-name">crop</div>
			</div>
			<div on:click={() => handleMarkerClick(2)} class="step-marker">
				<div class="step-number" id="marker2">3</div>
				<div class="step-name">color</div>
			</div>
			<div on:click={() => handleMarkerClick(3)} class="step-marker">
				<div class="step-number" id="marker3">4</div>
				<div class="step-name">create</div>
			</div>
		</div>
		<div class="step-title">
			{step_titles[current_step]}
		</div>
	</div>
	{#if current_step == 0}
		<Upload on:imagesubmit={handleImageSubmit} {loadingOn} {loadingOff}/>
	{:else if current_step == 1}
		<Crop on:cropsubmit={handleCropSubmit} src_img={uploaded_image} {loadingOn} {loadingOff}/>
	{:else if current_step == 2}
		<Color on:colorsubmit={handleColorSubmit} src_img={cropped_image} palette={color_palette}/>
	{:else if current_step == 3}
		<Create on:createsubmit={handleCreateSubmit} src_img={cropped_image} palette={color_palette} bind:published={published} {loadingOn} {loadingOff} {pbn_name} {pbn_tags}/>
	{:else}
		Error!
	{/if}
</div>

<style>
	.loading-pane{
		cursor: wait;
		position: absolute;
		width: 100vw;
		min-height: 100vh;
		bottom:0;
		background-color: black;
		opacity: .7;
	}
	.step-header{
		display: flex;
		justify-content: space-between;
		background-color: #1687a7;
		padding: 1em;
		align-items: center;
		color: white;
	}
	.step-tracker{
		display: flex;
		justify-content: space-between;
	}
	.step-marker{
		margin-right: 0.75em;
		text-align: center;
	}
	.step-marker:hover{
		cursor: pointer;
	}
	.step-name{
		width: 0;
		height: 0;
		overflow: hidden;
	}
	.step-number{
		width: 24px;
		height: 24px;
		line-height: 24px;
		background-color: "#bbb";
		text-align: center;
		font-size: 20px;
		font-weight: bold;
		vertical-align: center;
		border-radius: 12px;
		color: #1687a7;
	}
	.step-title{
		font-size: large;
	}

	@media only screen and (min-width: 768px) {
		.step-header{
			display: flex;
			justify-content: space-between;
			background-color: #1687a7;
			padding: 1em;
			align-items: center;
			color: white;
		}
		.step-tracker{
			display: flex;
			justify-content: space-between;
		}
		.step-marker{
			margin-right: 1.5em;
			text-align: center;
		}
		.step-name{
			width: auto;
			height: auto;
			font-size: normal;
		}
		.step-number{
			width: 48px;
			height: 48px;
			line-height: 48px;
			text-align: center;
			font-size: 30px;
			font-weight: bold;
			vertical-align: center;
			border-radius: 24px;
			color: #1687a7;
		}
		.step-title{
			text-align: right;
			font-size: xx-large;
		}
	}
</style>
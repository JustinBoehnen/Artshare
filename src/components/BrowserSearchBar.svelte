<script>
	import RangeSlider from 'svelte-range-slider-pips'

	//props
	export let searchResults = []

	//vars
	let filterName = ''
	let filterCreator = ''
	let filterTags = ''
	let filterColors = [10, 30]
	let query = {}

	async function FetchSearchResults() {
		query = {
			name: filterName,
			username: filterCreator,
			tags: ParseTags(filterTags),
			'min-colors': filterColors[0],
			'max-colors': filterColors[1],
		}

		const response = await fetch(`http://localhost:3000/browser/search.json`, {
			method: 'POST',
			body: JSON.stringify(query),
			headers: {
				'Content-Type': 'application/json',
			},
		})

		const json = await response.json()
		searchResults = json
	}

	function ParseTags() {
		if (filterTags != '') {
			return filterTags
				.split(' ')
				.join('')
				.split(',')
				.map((t) => t.toLowerCase())
		}

		return []
	}
</script>

<div class="position-container">
	<form class="container">
		<div class="search-bar-item">
			<label for="name">name</label>
			<input id="name" name="name" type="text" bind:value={filterName} />
		</div>
		<div class="search-bar-item">
			<label for="creator">creator</label>
			<input id="creator" name="creator" type="text" bind:value={filterCreator} />
		</div>
		<div class="search-bar-item">
			<label for="tags">tags</label>
			<input id="tags" name="tags" type="text" bind:value={filterTags} />
		</div>
		<div class="search-bar-item">
			<div class="slider">
				<label for="slider">number of colors: {filterColors[0]} to {filterColors[1]}</label>
				<RangeSlider id="slider" range pushy step={1} min={2} max={100} bind:values={filterColors} />
			</div>
		</div>
		<div class="search-bar-item submit-button">
			<button onclick="return false" on:click={FetchSearchResults}>search</button>
		</div>
	</form>
</div>

<style>
	.container {
		display: flex;
		background-color: #1687a7;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		flex-wrap: wrap;
	}
	input {
		margin: 0.5em;
	}
	.search-bar-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: white;
		flex-grow: 1;
		margin: 0.5em 1em 0.5em 1em;
	}
	.submit-button {
		display: flex;
		flex-grow: 0;
		text-align: right;
	}
	.slider {
		flex: 0 1 auto;
		order: 0;
		position: relative;
		align-items: center;
		width: 100%;
		min-width: 20em;
		text-align: center;
	}
	button {
		background-color:#276678;
		border-radius:42px;
		display:inline-block;
		cursor:pointer;
		color:#ffffff;
		font-family:Arial;
		font-size:15px;
		font-weight:bold;
		padding:10px 39px;
		text-decoration:none;
	}
	button:hover {
		background-color:#4a40d4;
	}
	button:active {
		position:relative;
		top:1px;
		outline: none;
	}
	input[type='text'] {
		width: 100%;
		min-width: 15em;
		margin: 0.5em 0 0 0;
	}
	input[type='text']:focus {
		background-color: #4a40d4;
		color: white;
		outline: none;
	}
</style>

<script>
	import ItemCard from './BrowserPBNItem.svelte'
	import PBNDetails from '../routes/browser/pbn.svelte'

	//props
	export let searchResults = []
	let selectedPBN = {}
	let onDetailsPage = false

	let openDetails = (event) => {
		console.log(event.detail.pbn)
		onDetailsPage = true
		selectedPBN = event.detail.pbn
	}

	let closeDetails = () => {
		onDetailsPage = false
	}
</script>

{#if onDetailsPage}
	<PBNDetails on:toggle={closeDetails} {selectedPBN}/>
{/if}
{#if !onDetailsPage}
<div class="container">
	{#each searchResults as pbn}
		<ItemCard {pbn} on:toggle={openDetails} {selectedPBN}/>
	{:else}
		Search returned no results!
	{/each}
</div>
{/if}

<style>
	.container {
    display: flex;
    flex-wrap: wrap;
	flex-direction: row;
	justify-content: space-evenly;
	overflow: hidden;
	text-overflow: ellipsis;
  }
</style>
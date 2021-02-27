<svelte:head>
	<title>Browse</title>
</svelte:head>

<script>
	import BrowserSearchBar from '../../components/BrowserSearchBar.svelte'
	import PBNGallery from '../../components/PBNGallery.svelte'
	let searchResults = []
</script>

<div>
	<BrowserSearchBar bind:searchResults />
	<PBNGallery bind:searchResults />
</div>
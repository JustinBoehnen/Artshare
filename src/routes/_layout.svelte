<script>
	import { VerifyToken } from '../stores/auth-store'
	import { onMount } from 'svelte';
	import Nav from '../components/Nav.svelte';

	export let segment;

	onMount(async () => {
		let token = localStorage.getItem('token')
		if(token)
			VerifyToken(token)
	});
</script>

<style>
	main {
		position: relative;
		background-color: white;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>
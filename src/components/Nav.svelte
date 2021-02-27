<script>
	import { user, logged_in } from '../stores/auth-store'
	import { navHeight } from '../stores/position-store'
	export let segment;

	let logout = () => {
		localStorage.removeItem("token")
		$logged_in = false
	}
</script>

<div class="container" bind:clientHeight={$navHeight}>
	<div class="nav-button-group">
		<!--<a class="nav-button" aria-current="{segment === undefined ? 'page' : undefined}" href=".">home</a>-->
		<a class="nav-button" aria-current="{segment === 'browser' ? 'page' : undefined}" href="browser">browse</a>
		<a class="nav-button" aria-current="{segment === 'designer' ? 'page' : undefined}" href="designer">create</a>
		<a class="nav-button" aria-current="{segment === 'about' ? 'page' : undefined}" href="about">about</a>
	</div>
	{#if $logged_in}
		<div class="login-info">
			<div class="message">Hello, {$user.username}</div>
			<div class="login-buttons">
				<a href="/." on:click={logout}>logout</a>
			</div>
		</div>
	{/if}
	{#if !$logged_in}
		<div class="login-info">
			<div class="message">You are not logged in</div>
			<div class="login-buttons">
				<a rel=prefetch aria-current="{segment === 'login' ? 'page' : undefined}" href="auth/login">login</a>
				<a aria-current="{segment === 'register' ? 'page' : undefined}" href="auth/register">register</a>
			</div> 
		</div>
	{/if}
</div>

<style>
	.login-info {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		align-items: center;
	}
	.message{
		padding: 0.5em;
	}
	.login-buttons {
		display: flex;
		justify-content: space-between;
	}
	.login-buttons a {
		padding: 0;
		padding-left: 0.5em;
		text-decoration: underline;
	}
	a {
		text-decoration: none;
		padding: 0.3em 0.5em 0.3em 0;
		display: block;
	}
	.container {
		background-color: #276678;
		color: white;
		margin: 0;
		padding: 1em;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.nav-button-group {
		display: flex;
		flex-wrap: wrap;
		flex-direction: column;
	}
	.nav-button {
		margin-right: 1em;
		font-size: normal;
		cursor: pointer;
	}

	@media only screen and (min-width: 768px) {
		.nav-button-group {
			display: flex;
			flex-wrap: wrap;
			flex-direction: row;
		}
		.nav-button {
			margin-right: 1em;
			font-size: x-large;
			cursor: pointer;
		}
	}
</style>
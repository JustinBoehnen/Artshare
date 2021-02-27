/** @format */
import jwtDecode from 'jwt-decode'
import { writable } from 'svelte/store'

export const user = writable(null) // start with no user

export const logged_in = writable(false)

export async function TryLogin(email, password) {
	let query = {
		email: email,
		password: password,
	}

	const response = await fetch('http://localhost:3000/auth/login.json', {
		method: 'POST',
		body: JSON.stringify(query),
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (response.ok) {
		const json = await response.json()
		localStorage.setItem('token', json.jwt)
		let token = jwtDecode(json.jwt)

		user.set({
			id: token.id,
			username: token.username,
			email: token.email,
		})
		logged_in.set(true)
	}
}

export async function VerifyToken(token) {
	let query = {
		token: token,
	}

	const response = await fetch('http://localhost:3000/auth/validate.json', {
		method: 'POST',
		body: JSON.stringify(query),
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (response.ok) {
		const json = await response.json()
		localStorage.setItem('token', json.jwt)
		let token = jwtDecode(json.jwt)

		user.set({
			id: token.id,
			username: token.username,
			email: token.email,
		})
		logged_in.set(true)

		return true
	} else {
		return false
	}
}

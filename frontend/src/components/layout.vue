<template>
	<header>
		<section id="leftSection">
			<nav>
				<div v-if="user.data">
					<router-link :to="{name: 'browse'}" class="core_contentButton">
						<img src="../assets/browse.svg" alt="Globe icon" />
						<span>Browse</span>
					</router-link>
					<router-link :to="{name: 'createPost'}" class="core_contentButton">
						<img src="../assets/post.svg" alt="Pencil icon" style="transform: scaleX(-1)" />
						<span>Post</span>
					</router-link>
				</div>
				<div v-else>
					<router-link :to="{name: 'home'}" aria-label="Front page" id="logoLink">
						<img
							src="../assets/logo.svg"
							alt="Distillogue's Logo: A chemistry flask, with bubbling liquids, hung on a stand"
						/>
					</router-link>
					<router-link :to="{name: 'about'}" class="core_contentButton">
						<img src="../assets/megaphone.svg" alt="Megaphone icon" style="transform: scaleX(-1)" />
						<span>About</span>
					</router-link>
				</div>
			</nav>
		</section>
		<section id="rightSection">
			<nav>
				<div v-if="user.data">
					<router-link :to="{name: 'dashboard'}" class="core_contentButton">
						<img src="../assets/dashboard.svg" alt="Dashbard guage icon" />
						<span>Dashboard</span>
					</router-link>
					<button @click="logOut" class="core_contentButton">
						<img src="../assets/leave.svg" alt="Exiting icon" />
						<span>Logout</span>
					</button>
				</div>
				<router-link v-else :to="{name: 'join'}" class="core_contentButton">
					<img src="../assets/userWithoutPfp.svg" alt="Non-descript person icon" />
					<span>Join</span>
				</router-link>
			</nav>
		</section>
	</header>

	<div id="notificationsWrapper">
		<TransitionGroup name="notification">
			<div
				v-for="notif in notifications.list"
				:key="notif.id"
				role="alert"
				:class="
					'notification ' + (notif.desirability === true ? 'positive' : notif.desirability === false ? 'negative' : '')
				"
			>
				<p>
					{{ notif.text }}
					<!-- TODO - resolve accessibility issue: according to MDN, aria-live (which is implicit in role="alert") doesn't trigger when the element is added to the DOM -->
				</p>
				<button v-if="notif.manualDismiss" @click="notifications.delete(notif.id)">X</button>
			</div>
		</TransitionGroup>
		<div id="notifScrollAnchor"></div>
	</div>
</template>

<script setup lang="ts">
	import {useRouter} from "vue-router";
	import {useUser} from "../stores/user";
	import {apiFetch} from "../helpers/apiFetch";
	import {useNotifications} from "../stores/notifications";
	const user = useUser();
	const router = useRouter();
	const notifications = useNotifications();

	async function logOut() {
		const logoutRequest = await apiFetch("DELETE", "/sessions");

		if (logoutRequest.error) {
			notifications.create(logoutRequest.error.message, false, true);
			return;
		}

		user.$reset();
		localStorage.removeItem("sessionKey");
		router.push({name: "join"});
	}
</script>

<style scoped>
	header {
		position: sticky;
		top: 0;
		left: 0;
		width: 100%;
		height: 4em;
		z-index: 900;
		white-space: nowrap;
		background-color: var(--backgroundColor);
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75em;
		box-shadow: 0 0 0.75em 0.5em var(--backgroundColor);
	}

	#logoLink {
		height: 2.75em; /* without explictly declaring this, the button is annoyingly higher (not taller) than its box-shadow (at least on chrome 99) */
		border-radius: 10em;
	}
	#logoLink img {
		height: 2.75em;
	}
	#logoLink:focus,
	#logoLink:hover {
		outline: none;
		box-shadow: 0em 0em 0.35em 0.35em var(--highlightSubColor);
	}
	#logoLink:active {
		box-shadow: 0em 0em 0.35em 0.35em var(--highlightColor);
	}

	nav,
	nav > div {
		height: 3em;
		margin: 0.5em;
		width: fit-content;
		display: flex;
		align-items: center;
		gap: 1em;
	}

	.core_contentButton {
		font-size: 0.9em;
	}

	img:not(#logoLink img) {
		height: 1.25em;
		display: block;
		margin: 0 auto 0.25em;
	}

	span {
		font-size: 1.1em;
		display: none;
	}

	#notificationsWrapper {
		font-size: 1.2em;
		position: fixed;
		padding: 0;
		right: 0;
		bottom: 0;
		max-height: 100vh;
		max-width: 100vw;
		padding: 0.25em;
		z-index: 999;
		overflow: auto;
	}

	#notificationsWrapper::-webkit-scrollbar {
		display: none; /* because the vue enter transition was causing the scrollbar to pop and in and out every time a notif was created (under the overflow limit. when notifs overflowed the scrollbar would act as expected) */
	}

	.notification {
		color: var(--textColor);
		background-color: #666666;
		border-inline: 0.2em solid #aaaaaa;
		width: fit-content;
		padding: 0.3em;
		margin: 0 0 0.25em auto;
		overflow-anchor: none;
		display: flex;
		gap: 0.25em;
	}
	.notification.negative {
		background-color: #880000;
		border-color: #ff0000;
	}
	.notification.positive {
		background-color: #008800;
		border-color: #00ff00;
	}

	.notification p {
		display: inline;
		margin-bottom: 0;
	}

	.notification button {
		padding: 0.1em 0.2em 0.05em;
		border-radius: 0.25em;
		user-select: none;
		background-color: #aaa;
		transition: background-color 0.2s;
	}
	.notification.negative button {
		background-color: #ff0000;
	}
	.notification.positive button {
		background-color: #00ff00;
	}

	.notification button:hover,
	.notification button:focus {
		background-color: var(--highlightSubColor);
	}

	.notification button:active {
		background-color: var(--highlightColor);
	}

	.notification-enter-from {
		max-height: 0em;
		opacity: 0;
	}
	.notification-enter-to {
		max-height: 15em;
		opacity: 1;
	}
	.notification-enter-active {
		transition: all 300ms ease-in;
	}
	.notification-leave-from {
		max-height: 15em;
		opacity: 1;
	}
	.notification-leave-to {
		max-height: 0em;
		opacity: 0;
	}
	.notification-leave-active {
		transition: all 200ms ease-in;
	}

	#notifScrollAnchor {
		overflow-anchor: auto;
		height: 1px;
	}

	@media (min-width: 25rem) {
		span {
			display: block;
		}
	}
</style>

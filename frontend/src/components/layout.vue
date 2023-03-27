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
		<notification v-model:text="notifText" :desirablityStyle="notifDesirability" />
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
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {useRouter} from "vue-router";
	import {useUser} from "../stores/user";
	import {apiFetch} from "../helpers/apiFetch";
	import notification from "./notification.vue";
	const user = useUser();
	const router = useRouter();

	const notifText = ref("");
	const notifDesirability = ref<boolean | null>(null);

	async function logOut() {
		notifText.value = "";
		notifDesirability.value = null;

		const logoutRequest = await apiFetch("DELETE", "/sessions");

		if (logoutRequest.error) {
			notifText.value = logoutRequest.error.message;
			notifDesirability.value = false;
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
		height: 2.75em;
	} /* without explictly declaring this, the button is annoying higher (not taller) than its box-shadow (at least on chrome 99) */
	#logoLink img {
		height: 2.75em;
	}
	#logoLink:focus,
	#logoLink:hover {
		outline: none;
		border-radius: 10em;
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

	@media (min-width: 25rem) {
		span {
			display: block;
		}
	}
</style>

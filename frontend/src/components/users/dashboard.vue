<template>
	<section id="dashboardContainer">
		<nav aria-label="Dashboard navigation">
			<button @click="currentPage = 'profile'" :inert="currentPage === 'profile'" class="core_contentButton">
				<img src="../../assets/userWithoutPfp.svg" alt="Non-descript person icon" />
				<span>Profile</span>
			</button>
			<button @click="currentPage = 'drafts'" :inert="currentPage === 'drafts'" class="core_contentButton">
				<img src="../../assets/drafts.svg" alt="Paper tray icon" />
				<span>Drafts</span>
			</button>
			<button @click="currentPage = 'presets'" :inert="currentPage === 'presets'" class="core_contentButton">
				<img
					src="../../assets/presets.svg"
					alt="Icon of a browser window stacked on another one, with the top window containing a cogwheel"
				/>
				<span>Presets</span>
			</button>
			<button @click="currentPage = 'contacts'" :inert="currentPage === 'contacts'" class="core_contentButton">
				<img src="../../assets/contacts.svg" alt="Address book icon" />
				<span>Contacts</span>
			</button>
		</nav>
	</section>
	<section id="dashboardPage">
		<profileEditor v-if="currentPage === 'profile'" />
		<draftsEditor v-if="currentPage === 'drafts'" />
		<presetsEditor v-if="currentPage === 'presets'" />
		<contactsEditor v-if="currentPage === 'contacts'" />
	</section>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import profileEditor from "./dashboardSections/profileEditor.vue";
	import draftsEditor from "./dashboardSections/draftsEditor.vue";
	import presetsEditor from "./dashboardSections/presetsEditor.vue";
	import contactsEditor from "./dashboardSections/contactsEditor.vue";

	type pageName = "profile" | "drafts" | "presets" | "contacts";
	const currentPage = ref<pageName>("profile");
</script>

<style scoped>
	#dashboardContainer {
		display: flex;
		font-size: 1.5em;
		gap: 0.75em;
	}

	button {
		width: 100%;
		white-space: nowrap;
		font-weight: bold;
		padding: 0.4em;
	}

	img {
		height: 1.2em;
		vertical-align: bottom;
	}
	img + span {
		display: none;
		margin-left: 0.25em;
	}

	nav button {
		display: block;
		color: var(--textColor);
		background-color: transparent;
	}

	#dashboardPage {
		flex-grow: 1;
	}

	@media (min-width: 40em) {
		img + span {
			display: inline;
		}
	}
</style>

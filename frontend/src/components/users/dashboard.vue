<template>
	<section id="dashboardContainer">
		<section id="dashboardSidebar">
			<transition name="collapse">
				<button
					v-show="changes.length > 0"
					id="dashboardSubmit"
					class="core_backgroundButton"
					@click="submitAllChanges"
				>
					<img src="../../assets/save.svg" alt="Floppy disk icon" />
					<span>Save</span>
				</button>
			</transition>
			<nav aria-label="Dashboard page navigation">
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
			<notification :text="submitNotif.text" :desirablityStyle="submitNotif.style" />
			<transition name="swap" mode="out-in">
				<!-- i'd use v-show for these, but multiple ones in a transition unfortunately only renders the initial one -->
				<profileEditor v-if="currentPage === 'profile'" @newState="updateChangesByNewState" />
				<draftsEditor v-if="currentPage === 'drafts'" @newState="updateChangesByNewState" />
				<presetsEditor v-if="currentPage === 'presets'" @newState="updateChangesByNewState" />
				<contactsEditor v-if="currentPage === 'contacts'" @newState="updateChangesByNewState" />
			</transition>
		</section>
	</section>
</template>

<script setup lang="ts">
	import {ref, reactive} from "vue";
	import {useUser} from "../../stores/user";
	import {useDashboardEdits} from "../../stores/dashboardEdits";
	import {getSessionKey} from "../../helpers/getSessionKey";
	import {jsonFetch} from "../../helpers/jsonFetch";
	import {UserPatchRequest} from "../../../../shared/objects/api";
	import {editableUserData} from "../../../../shared/objects/user";
	import {deepCloneFromReactive} from "../../helpers/deepCloneFromReactive";
	import notification from "../notification.vue";
	import profileEditor from "./dashboardSections/profileEditor.vue";
	import draftsEditor from "./dashboardSections/draftsEditor.vue";
	import presetsEditor from "./dashboardSections/presetsEditor.vue";
	import contactsEditor from "./dashboardSections/contactsEditor.vue";
	const user = useUser();
	const changes = useDashboardEdits().edits;

	type pageName = "profile" | "drafts" | "presets" | "contacts";
	const currentPage = ref<pageName>("profile");
	const submitNotif = reactive({text: "", style: undefined as boolean | undefined});

	function updateChangesByNewState(newStates: UserPatchRequest<editableUserData>[]) {
		newStates.forEach((state) => {
			const existingChangeIndex = changes.findIndex((change) => change.dataName === state.dataName);
			const prevChangeExists = existingChangeIndex === -1 ? false : true;

			const inputMatchesUserData =
				typeof state.newValue === "object" && state.newValue !== null
					? JSON.stringify(state.newValue) === JSON.stringify(user.data![state.dataName]) // flawed (as it depends on the contents of both to be in the same sequence), but it's *good enough* as of the current stage of dev (june 2022)
					: state.newValue === user.data![state.dataName];
			if (!prevChangeExists && inputMatchesUserData) {
				return;
			}

			if (!prevChangeExists) {
				changes.push(state);
				return;
			}

			inputMatchesUserData
				? changes.splice(existingChangeIndex, 1)
				: (changes[existingChangeIndex].newValue = state.newValue);
		});
	}

	async function submitAllChanges() {
		submitNotif.text = "Submitting changes...";
		submitNotif.style = undefined;

		const changesResponse = await jsonFetch("PATCH", "/users", changes, getSessionKey());

		if (changesResponse.error) {
			submitNotif.text = changesResponse.error.message;
			submitNotif.style = false;
			return;
		}

		submitNotif.text = "Changes saved!";
		submitNotif.style = true;
		changes.forEach((change) => {
			(user.data![change.dataName] as any) = deepCloneFromReactive(change).newValue; // considering the circumstances, i dont think coercing an "any" here is actually harmful
		});
		changes.length = 0;
	}
</script>

<style scoped>
	#dashboardContainer {
		display: flex;
		font-size: 1.5em;
		gap: 0.75em;
	}

	#dashboardSidebar button {
		width: 100%;
		white-space: nowrap;
		font-weight: bold;
		padding: 0.4em;
	}

	#dashboardSubmit img {
		filter: var(--filterToBackgroundColor);
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

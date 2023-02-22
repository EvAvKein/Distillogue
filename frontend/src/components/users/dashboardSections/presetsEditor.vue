<template>
	<section>
		<ol>
			<TransitionGroup name="collapse">
				<li v-for="(preset, index) in user.data!.presets">
					<button type="button" class="core_backgroundButton" @click="selectPreset(index)">
						<p :key="reassignToRerenderList + index">{{ preset.name || "[No Title]" }}</p>
					</button>
				</li>
			</TransitionGroup>
		</ol>

		<transition name="collapse">
			<button v-if="user.data!.presets.length < maxPresets" class="core_backgroundButton" @click="createPreset">
				<p>New preset</p>
			</button>
			<notification v-else :text="'Presets at capacity, consider triage'" :desirablityStyle="null" />
		</transition>

		<notification :text="notif.text" :desirablityStyle="notif.desirability" />

		<transition name="collapse">
			<section v-if="typeof currentPreset.index === 'number'">
				<labelledInput
					id="presetNameInput"
					:inputId="'editPresetName'"
					:type="'text'"
					:label="'Name'"
					v-model="currentPreset.name"
					@update:modelValue="updateCurrentPreset"
				/>
				<editCurrentConfig
					id="editConfig"
					:hideUnsavables="true"
					:config="currentPreset.config"
					@update:config="updateCurrentPreset"
				/>
				<button id="deletionButton" class="core_contentButton" @click="deleteCurrentPreset">
					<img src="../../../assets/trash.svg" alt="Trashcan icon" />
					<span>Delete</span>
				</button>
			</section>
		</transition>
	</section>
</template>

<script setup lang="ts">
	import {ref, toRaw} from "vue";
	import {user as userValidation} from "../../../../../shared/objects/validationUnits";
	import {apiFetch} from "../../../helpers/apiFetch";
	import {useUser} from "../../../stores/user";
	import {UserPatchRequest} from "../../../../../shared/objects/api";
	import {UserData} from "../../../../../shared/objects/user";
	import {debounce} from "../../../helpers/debounce";
	import notification from "../../notification.vue";
	import labelledInput from "../../labelledInput.vue";
	import editCurrentConfig from "../../posts/create/config/editConfig.vue";
	const user = useUser();

	const maxPresets = userValidation.presets.max;

	const currentPreset = ref({
		name: "" as UserData["presets"][number]["name"],
		config: {} as UserData["presets"][number]["config"],
		index: null as number | null,
	});

	const notif = ref({
		text: "",
		desirability: null as boolean | null,
	});

	// const smotherUpdateRequests = ref(false); // because the config component emits the update event twice (therefore triggering the a duplicate API request which pops an error), and using a watcher instead of an @update doesn't work because it doesn't react to deep changes (even with the deep option on)
	const reassignToRerenderList = ref(0);

	function createPreset() {
		requestPresetsUpdate([...toRaw(user.data!.presets), {name: "", config: {}}]).then(() => {
			selectPreset(user.data!.presets.length - 1);
		});
	}

	function selectPreset(index: number) {
		const selectedPreset = toRaw(user.data!.presets[index]);

		currentPreset.value.name = selectedPreset.name;
		currentPreset.value.config = selectedPreset.config;
		currentPreset.value.index = index;
		reassignToRerenderList.value += 1;
	}

	function updateCurrentPreset() {
		const newPresetsState = toRaw(user.data!.presets);
		newPresetsState[currentPreset.value.index!] = {
			name: toRaw(currentPreset.value.name),
			config: toRaw(currentPreset.value.config),
		};

		debounce(500, () => {
			requestPresetsUpdate(newPresetsState);
		});
	}

	async function deleteCurrentPreset() {
		const presetsWithoutCurrent = user.data!.presets.filter((preset, index) => index !== currentPreset.value.index);
		const successfulDeletion = await requestPresetsUpdate(presetsWithoutCurrent);
		if (successfulDeletion) currentPreset.value.index = null;
	}

	async function requestPresetsUpdate(newPresetsState: NonNullable<typeof user.data>["presets"]) {
		notif.value.text = "";

		const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("presets", newPresetsState)]);

		if (response.error) {
			notif.value.text = response.error.message;
			notif.value.desirability = false;
			return false;
		}
		user.data!.presets = newPresetsState;
		reassignToRerenderList.value += 1;
		return true;
	}
</script>

<style scoped>
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li + li,
	ol + button {
		margin-top: 0.5em;
	}
	li button {
		font-size: 1.1em;
	}
	li button,
	ol + button {
		padding: 0.3em;
		width: 100%;
	}
	ol + button {
		font-size: 0.9em;
		display: block;
		width: 90%;
		margin-inline: auto;
	}

	button p {
		margin: 0;
	}
	ol button p {
		font-weight: bold;
	}

	#presetNameInput {
		font-size: 1.3em;
	}
	#editConfig {
		margin-block: 1em 0.5em;
		font-size: 0.9em;
	}

	#deletionButton {
		display: block;
		margin: auto;
	}
	#deletionButton img {
		height: 1.75em;
	}
	#deletionButton span {
		vertical-align: super;
	}
</style>

<!-- there's quite a lot of code duplication between this component and ./draftsEditor.vue (at least as of 3.2.23), but creating a shared component would result in an obtuse mixture of parameters, named slots and interactions between them (or a single component which basically contains all of both components and has a bunch of conditionals). the current, code-duplicating setup sacrifices DRYness in favor of readability/maintainability (as backwards as that statement may be in most situations) -->

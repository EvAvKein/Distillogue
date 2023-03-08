<template>
	<section>
		<ol>
			<TransitionGroup name="collapse">
				<li v-for="(draft, index) in user.data!.drafts">
					<button type="button" class="core_backgroundButton" @click="selectDraft(index)">
						<p :key="reassignToRerenderList + index">{{ draft.title || "[No Title]" }}</p>
						<div :key="reassignToRerenderList + index">Edited: <timestamp :pastUnix="draft.lastEdited" /></div>
					</button>
				</li>
			</TransitionGroup>
		</ol>

		<transition>
			<button v-if="user.data!.drafts.length < maxDrafts" class="core_backgroundButton" @click="createDraft">
				<p>New draft</p>
			</button>
			<notification v-else :text="'Drafts at capacity, consider triage'" :desirablityStyle="null" />
		</transition>

		<notification :text="notif.text" :desirablityStyle="notif.desirability" />

		<transition name="collapse">
			<section v-if="typeof currentDraft.index === 'number'">
				<labelledInput
					:inputId="'editDraftTitle'"
					:type="'text'"
					:label="'Title'"
					v-model="currentDraft.title"
					@update:modelValue="updateCurrentDraft"
				/>
				<labelledInput
					:inputId="'editDraftBody'"
					:type="'textarea'"
					:label="'Body'"
					:minLineHeight="4"
					v-model="currentDraft.body"
					@update:modelValue="updateCurrentDraft"
				/>
				<button id="deletionButton" class="core_contentButton" @click="deleteCurrentDraft">
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
	import {unix as unixStamp} from "../../../../../shared/helpers/timestamps";
	import timestamp from "../../timestamp.vue";
	import notification from "../../notification.vue";
	import labelledInput from "../../labelledInput.vue";
	import {debounce} from "../../../helpers/debounce";
	const user = useUser();

	const reassignToRerenderList = ref(0);

	const maxDrafts = userValidation.drafts.max;

	const currentDraft = ref({
		title: "",
		body: "",
		index: null as number | null,
	});

	const notif = ref({
		text: "",
		desirability: null as boolean | null,
	});

	function createDraft() {
		requestDraftsUpdate([...user.data!.drafts, {title: "", body: "", lastEdited: unixStamp()}]).then(() =>
			selectDraft(user.data!.drafts.length - 1)
		);
	}

	function selectDraft(index: number) {
		const selectedDraft = user.data!.drafts[index];

		currentDraft.value.title = selectedDraft.title;
		currentDraft.value.body = selectedDraft.body;
		currentDraft.value.index = index;
		reassignToRerenderList.value += 1;
	}

	function updateCurrentDraft() {
		const {title, body, index} = currentDraft.value;
		const newDraftsState = toRaw(user.data!.drafts);
		newDraftsState[index!] = {title: title, body: body, lastEdited: unixStamp()};

		debounce(500, () => requestDraftsUpdate(newDraftsState));
	}

	function deleteCurrentDraft() {
		const draftsWithoutCurrent = user.data!.drafts.filter((draft, index) => index !== currentDraft.value.index);
		requestDraftsUpdate(draftsWithoutCurrent);
		currentDraft.value.index = null;
	}

	async function requestDraftsUpdate(newDraftsState: NonNullable<typeof user.data>["drafts"]) {
		notif.value.text = "";

		const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("drafts", newDraftsState)]);

		if (response.error) {
			notif.value.text = response.error.message;
			notif.value.desirability = false;
			return;
		}
		user.data!.drafts = newDraftsState;
		reassignToRerenderList.value += 1;
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
	li button,
	ol + button {
		font-size: 0.9em;
		padding: 0.3em;
		width: 100%;
	}
	ol + button {
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
	ol button div {
		font-size: 0.7em;
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

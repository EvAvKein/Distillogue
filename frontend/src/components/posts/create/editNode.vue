<template>
	<section id="texts">
		<section id="drafts">
			<TransitionGroup name="collapse">
				<button
					v-for="(draft, index) in user.data!.drafts"
					:key="draft.title + index"
					type="button"
					class="core_backgroundButton draftButton"
					@click="selectDraft(index)"
				>
					{{ draft.title || "[No Title]" }}
				</button>
				<div>
					<button id="saveDraft" type="button" class="core_borderButton" :inert="draftsAtCapacity" @click="saveDraft">
						{{ draftsAtCapacity ? "Drafts at capacity" : "Save draft" }}
					</button>
					<button
						v-if="typeof data.deletedDraftIndex === 'number'"
						id="preserveDraftButton"
						type="button"
						class="core_borderButton"
						@click="selectDraft(undefined)"
					>
						Preserve draft {{ data.deletedDraftIndex + 1 }}
					</button>
				</div>
			</TransitionGroup>
		</section>
		<labelledInput
			id="title"
			:label="'Title'"
			:type="'text'"
			:required="true"
			:inputId="'nodeTitle'"
			v-model="data.title"
		/>
		<labelledInput
			:label="'Body'"
			:type="'textarea'"
			:minLineHeight="15"
			:required="true"
			:inputId="'nodeBody'"
			v-model="data.body"
		/>
	</section>
</template>

<script setup lang="ts">
	import {computed} from "vue";
	import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";
	import {NodeCreationRequest} from "../../../../../shared/objects/post";
	import {UserPatchRequest} from "../../../../../shared/objects/api";
	import {user as userLimits} from "../../../../../shared/objects/validationUnits";
	import {unix} from "../../../../../shared/helpers/timestamps";
	import {apiFetch} from "../../../helpers/apiFetch";
	import {useUser} from "../../../stores/user";
	import labelledInput from "../../labelledInput.vue";
	const user = useUser();

	const props = defineProps<{
		data: NodeCreationRequest;
	}>();

	const emit = defineEmits(["error"]);
	const draftsAtCapacity = computed(() => user.data!.drafts.length >= userLimits.drafts.max);

	function selectDraft(index: number | undefined) {
		props.data.deletedDraftIndex = index;
		if (index === undefined) {
			return;
		}

		const {title, body} = deepCloneFromReactive(user.data!.drafts[index]);
		props.data.title = title;
		props.data.body = body;
		props.data.deletedDraftIndex = index;
	}

	async function saveDraft() {
		if (draftsAtCapacity.value) return;

		const newDraftsState = [
			...deepCloneFromReactive(user.data!.drafts),
			{title: props.data.title, body: props.data.body, lastEdited: unix()},
		];

		const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("drafts", newDraftsState)]);

		if (response.error) {
			emit("error", response.error);
			return;
		}

		user.data!.drafts = newDraftsState;
	}
</script>

<style scoped>
	#texts {
		font-size: clamp(1.25em, 2.25vw, 1.5em);
	}

	#drafts {
		margin-bottom: 0.25em;
	}

	#drafts > button {
		width: 100%;
		padding: 0.2em;
		font-weight: bold;
	}

	#drafts > button + button {
		margin-top: 0.25em;
	}

	#drafts div {
		font-size: 0.8em;
		display: flex;
		margin-top: 0.5em;
		gap: 0.5em;
	}

	#drafts div #saveDraft {
		flex-grow: 1;
	}
	#drafts div #preserveDraftButton {
		flex-grow: 2;
	}

	#title {
		font-size: 1.15em;
	}
</style>

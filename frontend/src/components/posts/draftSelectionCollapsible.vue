<template>
	<transition name="collapse" appear>
		<customDetails class="draftsDetails">
			<template #summary>
				<span id="draftsTitle">Drafts</span>
			</template>
			<template #content>
				<section id="draftsContent">
					<button
						v-for="(draft, index) in user.data!.drafts"
						type="button"
						class="core_backgroundButton"
						@click="() => selectDraft(draft, index)"
					>
						<p>{{ draft.title || "[No Title]" }}</p>
						<div>Edited: <timestamp :pastUnix="draft.lastEdited" /></div>
					</button>
					<transition name="collapse">
						<button
							v-if="typeof latestDraftIndex === 'number'"
							type="button"
							id="preserveDraftButton"
							class="core_backgroundButton"
							@click="unselectDraft"
						>
							Preserve chosen draft
						</button>
					</transition>
				</section>
			</template>
		</customDetails>
	</transition>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {UserData} from "../../../../shared/objects/user";
	import {deepCloneFromReactive} from "../../helpers/deepCloneFromReactive";
	import timestamp from "../timestamp.vue";
	import {useUser} from "../../stores/user";
	import customDetails from "../animatedDetails.vue";
	const user = useUser();

	const latestDraftIndex = ref<number | null>();

	const emit = defineEmits(["draftSelected"]);

	function selectDraft(draft: UserData["drafts"][number], index: number) {
		latestDraftIndex.value = index;
		const clonedDraft = deepCloneFromReactive(draft);
		emit("draftSelected", {draft: clonedDraft, index: index});
	}

	function unselectDraft() {
		latestDraftIndex.value = null;
		emit("draftSelected", null);
	}
</script>

<style scoped>
	.draftsDetails {
		color: var(--textColor);
		padding: 0.5em;
		border-radius: 0.5em;
	}
	#draftsTitle {
		display: block;
		text-align: center;
	}

	#draftsContent {
		margin-top: 0.5em;
	}
	button {
		width: 100%;
		padding: 0.3em;
	}

	#preserveDraftButton {
		display: block;
		width: 90%;
		margin: 0.75em auto 0;
	}

	button p {
		font-weight: bold;
		margin-bottom: 0.1em;
		margin: 0;
	}

	button div {
		font-size: 0.7em;
	}

	button + button {
		margin-top: 1em;
	}
</style>

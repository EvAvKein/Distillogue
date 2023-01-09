<template>
	<section>
		<button
			v-for="(draft, index) in drafts"
			type="button"
			class="core_backgroundButton"
			@click="
				() => {
					emit('draftSelected', {draft, index});
				}
			"
		>
			<p>{{ draft.title || "[No Title]" }}</p>
			<div>Edited: <timestamp :pastUnix="draft.lastEdited" /></div>
		</button>
	</section>
</template>

<script setup lang="ts">
	import {watch, ref} from "vue";
	import {useUser} from "../../stores/user";
	import {UserData} from "../../../../shared/objects/user";
	import timestamp from "../timestamp.vue";
	const user = useUser();

	const props = defineProps<{
		editingModeDraftsState?: UserData["drafts"];
	}>();

	const drafts = ref(props.editingModeDraftsState || user.data!.drafts);
	const emit = defineEmits(["draftSelected"]);

	if (!props.editingModeDraftsState) {
		watch(user.data!, () => {
			drafts.value = user.data!.drafts;
		});
	}
</script>

<style scoped>
	button {
		width: 100%;
		padding: 0.3em;
	}
	button + button {
		margin-top: 1em;
	}

	p {
		font-weight: bold;
		margin-bottom: 0.1em;
		margin: 0;
	}
	div {
		font-size: 0.7em;
	}
</style>

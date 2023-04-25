<template>
	<section>
		<label>
			Public:
			<input
				type="checkbox"
				class="core_crudeInput"
				@change="(event) => {updateAccess('public', (event.currentTarget as HTMLInputElement).checked || undefined)}"
			/>
		</label>
	</section>
</template>

<script setup lang="ts">
	import {PostAccess} from "../../../../../shared/objects/post";

	const props = defineProps<{
		access: PostAccess;
	}>();

	const emit = defineEmits(["update:access"]);

	function updateAccess<P extends keyof PostAccess>(property: P, newValue: PostAccess[P]) {
		const access = props.access;
		newValue ? (access[property] = newValue) : delete access[property];
		emit("update:access", access);
	}
</script>

<style scoped>
	section {
		text-align: center;
		background-color: var(--backgroundSubColor);
		padding: 0.25em 0.5em;
		border-radius: 0.5em;
	}
</style>

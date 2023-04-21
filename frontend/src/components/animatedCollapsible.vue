<template>
	<section :aria-expanded="open">
		<button class="core_contentButton" type="button" @click="forcedState?.state ?? (open = !open)">
			<slot name="summary"></slot>
		</button>
		<transition name="collapse" v-show="forcedState?.state ?? open">
			<slot name="content"></slot>
		</transition>
	</section>
</template>

<script setup lang="ts">
	import {ref} from "vue";

	const props = defineProps<{
		openByDefault?: true;
		forcedState?: {state: boolean}; // workaround to an 'unintuitive' vue ruling: https://github.com/vuejs/vue/issues/4792#issue-203322901
	}>();

	const open = ref(props.openByDefault || false);
</script>

<style scoped>
	button {
		width: 100%;
		color: inherit;
		background-color: transparent;
		text-align: unset;
		padding: 0;
	}
</style>

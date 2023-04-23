<template>
	<section :aria-expanded="open">
		<button class="core_contentButton" type="button" @click="clicked">
			<slot name="summary"></slot>
		</button>
		<transition name="collapse" v-show="open">
			<slot name="content"></slot>
		</transition>
	</section>
</template>

<script setup lang="ts">
	import {ref, computed} from "vue";

	const props = defineProps<{
		openByDefault?: true;
		forcedState?: {state: boolean}; // workaround to an 'unintuitive' vue ruling: https://github.com/vuejs/vue/issues/4792#issue-203322901
	}>();

	const toggled = ref(props.openByDefault || false);
	const open = computed(() => props.forcedState?.state ?? toggled.value);

	const emit = defineEmits(["toggle"]);
	function clicked() {
		emit("toggle");
		// ^ because sometimes a parent component needs to force this component's state while still toggling it upon summary clicks (e.g at single-select accordions).
		// assigning the toggling function to a click event on the slotted elem isn't compatible with keyboard interactions, as the focus is on this button when the handler is on the slotted elem.
		// emitting this event allows the parent component to assign the handler to the toggle event instead (and this doesn't require an extra keyboard handler on this component's button because keyboard interactions on button trigger the click event)

		if (!props.forcedState?.state) toggled.value = !toggled.value;
	}
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

<template>
	<textarea
		v-if="inputType === 'textarea'"
		:value="initialValue"
		:minLength="minLength"
		:maxlength="maxLength"
		:placeholder="placeholder"
		required="true"
		@input="debouncedValueEmit"
		@keyup.enter="enterKey"
		ref="editable"
	></textarea>
	<input
		v-else
		:value="initialValue"
		:minLength="minLength"
		:maxLength="maxLength"
		:placeholder="placeholder"
		required="true"
		@input="debouncedValueEmit"
		@keyup.enter="enterKey"
		ref="editable"
	/>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {debounce, timerId} from "../helpers/debounce";

	const props = defineProps<{
		inputType?: "textarea";
		initialValue: string;
		minLength?: number;
		maxLength?: number;
		minLineHeight?: number;
		placeholder?: string;
		customDebounce?: number;
		enterKey?: () => void;
	}>();

	const editable = ref<null | HTMLInputElement>(null);

	const emit = defineEmits(["edit"]);

	let timer: timerId;
	function debouncedValueEmit(event: Event) {
		timer = debounce(props.customDebounce ?? 500, () => {
			const textLength = editable.value?.value.length || 0;

			textLength > (props.minLength ?? Number.NEGATIVE_INFINITY) ||
			textLength < (props.maxLength ?? Number.POSITIVE_INFINITY)
				? emit("edit", (event.target as HTMLInputElement).value)
				: clearTimeout(timer);
		});
	}
</script>

<style scoped>
	input,
	textarea {
		background-color: var(--backgroundColor);
		color: var(--textColor);
		text-overflow: ellipsis;
		border: none;
		border-radius: 0.05em;
	}
	textarea {
		resize: vertical;
		min-height: v-bind("(minLineHeight || 1) * 1.15 + 'em'");
	}

	input:focus,
	textarea:focus {
		outline: 0.05em solid var(--highlightSubColor);
	}

	input:invalid,
	textarea:invalid {
		outline: 0.1em solid red;
	}
</style>

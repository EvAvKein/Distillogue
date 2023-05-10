<template>
	<div>
		<textarea
			v-if="type === 'textarea'"
			:value="modelValue"
			:id="inputId"
			:minLength="minLength"
			:maxlength="maxLength"
			:required="required"
			placeholder=" "
			@input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
		></textarea>
		<input
			v-else
			:type="type"
			:value="modelValue"
			:id="inputId"
			:minLength="minLength"
			:maxLength="maxLength"
			:required="required"
			placeholder=" "
			@input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
		/>
		<label :for="inputId">{{ label || type }}</label>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		inputId: string;
		type: string;
		modelValue: string | number;
		label?: string;
		required?: boolean;
		minLength?: number;
		maxLength?: number;
		minLineHeight?: number;
	}>();

	const emit = defineEmits(["update:modelValue"]);
</script>

<style scoped>
	* {
		font-size: inherit;
	}
	div {
		position: relative;
	}

	label {
		position: absolute;
		top: 0.2em;
		left: 0.35em;
		font-size: 1.25em;
		color: var(--textSubColor);
		cursor: text;
		transition: all 250ms;
	}

	input,
	textarea {
		background-color: var(--backgroundColor);
		color: var(--textColor);
		padding-top: 0.65em;
		box-sizing: border-box;
		padding-left: 0.2em;
		width: 100%;
		border: none;
		border-left: 0.2em solid var(--textSubColor);
		min-height: v-bind("(minLineHeight || 1) * 1.15 + 'em'");
	}
	textarea {
		resize: vertical;
	}

	input:focus + label,
	textarea:focus + label {
		color: var(--highlightColor);
	}
	input:focus,
	textarea:focus {
		border-color: var(--highlightColor);
		outline: none;
	}

	label::first-letter {
		text-transform: capitalize;
	}
	input:focus + label,
	input:not(:placeholder-shown) + label,
	textarea:focus + label,
	textarea:not(:placeholder-shown) + label {
		top: 0;
		left: 0.6em;
		cursor: default;
		font-size: 0.65em;
		transition: all 150ms;
	}
</style>

<template>
	<section id="editConfig">
		<category v-if="!hideUnsavables" title="Access" class="category" :openByDefault="true">
			<label>
				Public: <input id="access.public" type="checkbox" @change="updateConfigByCheckbox" class="core_crudeInput" />
			</label>
		</category>
		<category title="Timestamps" class="category">
			<label>
				Interacted:
				<input id="timestamps.interacted" type="checkbox" @change="updateConfigByCheckbox" class="core_crudeInput" />
			</label>
		</category>
		<category title="Voting" class="category">
			<label>
				Upvotes: <input id="votes.up" type="checkbox" @change="updateConfigByCheckbox" class="core_crudeInput" />
			</label>
			<label>
				Downvotes: <input id="votes.down" type="checkbox" @change="updateConfigByCheckbox" class="core_crudeInput" />
			</label>
			<label>
				Anonymous: <input id="votes.anon" type="checkbox" @change="updateConfigByCheckbox" class="core_crudeInput" />
			</label>
		</category>
	</section>
</template>

<script setup lang="ts">
	import {watch, toRef, onMounted} from "vue";
	import {PostConfig} from "../../../../../../shared/objects/post";
	import category from "./configCategory.vue";

	const props = defineProps<{
		config: PostConfig;
		presetOverride?: PostConfig;
		hideUnsavables?: true;
	}>();

	const emit = defineEmits(["update:config"]);

	type keysFromAllObjects<T> = T extends object ? keyof T : never;
	type subkeyOfPostConfig = keysFromAllObjects<PostConfig[keyof PostConfig]>; // don't ask me why this works, but `keyof PostConfig[keyof PostConfig]` doesnt

	type configProperty = "votes";
	// i tried and failed to create a generic which, when provided the T of a key of PostConfig, returns the keys of PostConfig[T] (e.g keyOfPostConfigProp<"votes"> === "up"|"down"|"anon")
	// i'm not even sure it's possible
	type configSubproperty = "up";

	function editConfigProperty(property: keyof PostConfig, subproperty: subkeyOfPostConfig, newValue: true | undefined) {
		if (subproperty && !props.config[property]) {
			props.config[property] = {};
		}

		newValue
			? (props.config[property as configProperty]![subproperty as configSubproperty] = newValue)
			: delete props.config[property as configProperty]![subproperty as configSubproperty];

		if (typeof props.config[property] === "object" && Object.keys(props.config[property] as object).length == 0) {
			delete props.config[property];
		}
	}

	function checkboxEventToConfigValue(event: Event) {
		return (event.currentTarget as HTMLInputElement).checked || undefined;
	}

	function updateConfigByCheckbox(event: Event) {
		const configProperties = (event.target as HTMLInputElement).id.split(".");
		const property = configProperties[0] as keyof PostConfig;
		const subProperty = configProperties[1] as subkeyOfPostConfig;

		editConfigProperty(property, subProperty, checkboxEventToConfigValue(event));
		emit("update:config", props.config);
	}

	let inputsAffectedByPresets = [] as HTMLInputElement[];
	onMounted(() => {
		const presetDetailsElements = Array.from(
			document.querySelectorAll<HTMLDetailsElement>("#editConfig section[aria-label]")
		).filter((detailsElement) => {
			return detailsElement.querySelector("button")!.innerText === "Access" ? false : detailsElement;
		});
		presetDetailsElements.forEach((category) => {
			const inputsInCategory = Array.from(category.querySelectorAll<HTMLInputElement>("input"));
			inputsAffectedByPresets = inputsAffectedByPresets.concat(inputsInCategory);
		});

		updateConfigByPreset(props.config);
	});

	function updateConfigByPreset(preset: PostConfig) {
		inputsAffectedByPresets.forEach((inputElement) => {
			const configProperties = inputElement.id.split(".");
			const property = configProperties[0] as keyof PostConfig;
			const subProperty = configProperties[1] as subkeyOfPostConfig | undefined;

			if (subProperty) {
				inputElement.checked = preset[property as configProperty]?.[subProperty as configSubproperty] || false;
			} else {
				inputElement.checked = (preset[property] as true | undefined) || false;
			}
		});

		emit("update:config", preset);
	}

	const presetOverride = toRef(props, "presetOverride");
	watch(presetOverride, () => {
		if (presetOverride.value) {
			updateConfigByPreset(presetOverride.value);
		}
	});
</script>

<style scoped>
	label {
		width: max-content;
	}

	section {
		display: block;
	}
	.category + .category {
		margin-top: 0.5em;
	}
</style>

<template>
	<section id="editConfig">
		<animatedCollapsible v-for="(categoryObj, categoryKey) of postConfigReadable" class="category">
			<template #summary>
				<span>{{ postConfigReadable[categoryKey].name }}</span>
			</template>

			<template #content>
				<div>
					<label v-for="({name: configName}, configKey) of (categoryObj.props as mappedConfigCategory)">
						{{ configName }}:
						<input
							:id="categoryKey + '.' + configKey"
							class="core_crudeInput"
							type="checkbox"
							@change="(event) => {
						emit(
							'update:config',
							configAfterUpdate(categoryKey, configKey, (event.currentTarget as HTMLInputElement).checked || undefined)
						)
					}"
						/>
					</label>
				</div>
			</template>
		</animatedCollapsible>
	</section>
</template>

<script setup lang="ts">
	import {toRef, watch, onMounted} from "vue";
	import {PostConfig} from "../../../../../shared/objects/post";
	import {
		postConfigReadable,
		type subkeyOfPostConfig,
		type mappedConfigCategory,
	} from "../../../helpers/postConfigReadable";
	import animatedCollapsible from "../../animatedCollapsible.vue";

	const props = defineProps<{
		config: PostConfig;
	}>();

	const emit = defineEmits(["update:config"]);

	type configProp = "votes";
	type configSubprop = "up";
	// TODO: the above two types exist because i tried and failed to turn the below function into a generic which narrows the subproperty param based on the property param (so i could call `config[property][subproperty]` without the hard-typed overrides)
	// this commented-out generic and test are the closest i got, which may or may not be helpful
	//		type keyOfPostConfigProp<T extends keyof PostConfig> = keyof Required<PostConfig>[T];
	//		let test: keyOfPostConfigProp<"votes">;
	function configAfterUpdate(property: keyof PostConfig, subproperty: subkeyOfPostConfig, newValue: true | undefined) {
		const config = props.config;

		if (!config[property]) config[property] = {};

		newValue
			? (config[property as configProp]![subproperty as configSubprop] = newValue)
			: delete config[property as configProp]![subproperty as configSubprop];

		if (Object.keys(config[property] as object).length === 0) {
			delete config[property];
		}

		return config;
	}

	let inputsAffectedByPresets = [] as HTMLInputElement[];
	onMounted(() => {
		const presettableCateogryElements = Array.from(
			document.querySelectorAll<HTMLElement>("#editConfig section[aria-expanded]")
		);
		presettableCateogryElements.forEach((category) => {
			const inputsInCategory = Array.from(category.querySelectorAll<HTMLInputElement>("input"));
			inputsAffectedByPresets = inputsAffectedByPresets.concat(inputsInCategory);
		});

		updateConfigInputs();
	});

	function updateConfigInputs() {
		inputsAffectedByPresets.forEach((input) => {
			const configProperties = input.id.split(".");
			const property = configProperties[0] as keyof PostConfig;
			const subProperty = configProperties[1] as subkeyOfPostConfig;

			input.checked = Boolean(props.config[property as configProp]?.[subProperty as configSubprop]);
		});
	}

	const presetOverride = toRef(props, "config");
	watch(presetOverride, updateConfigInputs);
</script>

<style scoped>
	#editConfig {
		display: block;
	}

	.category {
		height: fit-content;
		width: 100%;
		white-space: nowrap;
		background-color: var(--backgroundSubColor);
		border-radius: 0.5em;
	}
	.category + .category {
		margin-top: 0.5em;
	}

	label {
		width: max-content;
	}

	span {
		display: block;
		text-align: center;
		font-size: 1.5em;
		padding: 0.25em 0.5em;
	}

	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5em 1em;
		gap: 0.5em 1.25em;
		border-top: 0.15em solid var(--textSubColor);
	}
</style>

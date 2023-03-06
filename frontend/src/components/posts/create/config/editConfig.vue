<template>
	<section id="editConfig">
		<category
			v-for="(categoryObj, categoryName) of configLayout"
			class="category"
			:title="(categoryName as string)"
			:openByDefault="categoryName === 'Access' || undefined"
		>
			<label v-for="configProp, configName in categoryObj!.config">
				{{ configName }}:
				<input
					:id="categoryObj!.prop + '.' + configProp"
					class="core_crudeInput"
					type="checkbox"
					@change="(event) => {
						emit(
							'update:config',
							configAfterUpdate(categoryObj!.prop, configProp as subkeyOfPostConfig, (event.currentTarget as HTMLInputElement).checked || undefined)
						)
					}"
				/>
			</label>
		</category>
	</section>
</template>

<script setup lang="ts">
	import {toRef, watch, onMounted} from "vue";
	import {PostConfig} from "../../../../../../shared/objects/post";
	import category from "./configCategory.vue";

	const props = defineProps<{
		config: PostConfig;
		hideUnsavables?: true;
	}>();

	const configLayout: {
		[key: string]: {prop: keyof PostConfig; config: {[key: string]: subkeyOfPostConfig}} | undefined;
	} = {
		Access: props.hideUnsavables
			? undefined
			: {
					prop: "access",
					config: {
						Public: "public",
					},
			  },
		Timestamps: {
			prop: "timestamps",
			config: {
				Interacted: "interacted",
			},
		},
		Voting: {
			prop: "votes",
			config: {
				Upvotes: "up",
				Downvotes: "down",
				Anonymous: "anon",
			},
		},
	};
	if (props.hideUnsavables) delete configLayout.Access;

	const emit = defineEmits(["update:config"]);

	type keysFromAllObjects<T> = T extends object ? keyof T : never;
	type subkeyOfPostConfig = keysFromAllObjects<PostConfig[keyof PostConfig]>; // don't ask me why this works, but `keyof PostConfig[keyof PostConfig]` doesnt

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
			document.querySelectorAll<HTMLElement>("#editConfig section[aria-label]")
		).filter((detailsElement) => {
			return detailsElement.querySelector("button")!.innerText === "Access" ? false : detailsElement;
		});
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

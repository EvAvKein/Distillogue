<!-- TODO: the collapsible transitions are a bit disorienting, consider implementing a custom collapsible -->

<template>
	<main>
		<form id="createPost" v-if="user.data" @submit.prevent>
			<animatedCollapsible
				:forcedState="{state: currentTab === 'access'}"
				@toggle="currentTab = 'access'"
				class="section"
			>
				<template #summary>
					<div class="sectionTab">Access</div>
				</template>
				<template #content>
					<editAccess v-model:access="postAccess" id="access" @error="displayError" />
				</template>
			</animatedCollapsible>

			<animatedCollapsible :forcedState="{state: currentTab === 'text'}" @toggle="currentTab = 'text'" class="section">
				<template #summary>
					<div class="sectionTab">Text</div>
				</template>
				<template #content>
					<editNode v-model:data="nodeData" id="texts" @error="displayError" />
				</template>
			</animatedCollapsible>

			<animatedCollapsible
				:forcedState="{state: currentTab === 'config'}"
				@toggle="currentTab = 'config'"
				class="section"
			>
				<template #summary>
					<div class="sectionTab">Configuration</div>
				</template>
				<template #content>
					<div id="config">
						<TransitionGroup name="collapse">
							<button
								v-for="(preset, index) in defaultPresets.concat(user.data!.presets)"
								:key="preset.name + index"
								class="presetButton"
								type="button"
								@click="postConfig = deepCloneFromReactive(preset.config)"
							>
								<img
									v-if="index < defaultPresets.length"
									src="../../assets/defaultConfig.svg"
									alt="Icon of cogwheel inside a browser window"
								/>
								<img v-else src="../../assets/customConfig.svg" alt="Icon of cogwheel beside a pencil" />
								<span>{{ preset.name || "[No Title, Edit in Dashboard]" }}</span>
							</button>
						</TransitionGroup>
						<editConfig v-model:config="postConfig" id="editConfig" />
						<button
							@click="savePreset"
							type="button"
							id="savePresetButton"
							class="core_borderButton"
							:inert="presetsAtCapacity ? true : false"
						>
							{{ presetsAtCapacity ? "Presets at capacity" : "Save preset" }}
						</button>
					</div>
				</template>
			</animatedCollapsible>

			<section id="confirmation">
				<button id="submitButton" type="button" class="core_backgroundButton" @click="submitNode">
					Post
					{{
						typeof nodeData.deletedDraftIndex === "number" ? ` (& delete draft ${nodeData.deletedDraftIndex + 1})` : ""
					}}
				</button>
				<notification v-model:text="notifText" :desirablityStyle="false" />
			</section>
		</form>
	</main>
</template>

<script setup lang="ts">
	import {ref, computed} from "vue";
	import {deepCloneFromReactive} from "../../helpers/deepCloneFromReactive";
	import {UserData} from "../../../../shared/objects/user";
	import {Post, PostConfig, PostAccess} from "../../../../shared/objects/post";
	import {
		FetchResponse,
		NodeCreationRequest,
		PostCreationRequest,
		UserPatchRequest,
	} from "../../../../shared/objects/api";
	import {apiFetch} from "../../helpers/apiFetch";
	import {user as userCaps} from "../../../../shared/objects/validationUnits";
	import {useUser} from "../../stores/user";
	import {useRouter} from "vue-router";
	import animatedCollapsible from "../../components/animatedCollapsible.vue";
	import editNode from "../../components/posts/edit/editNode.vue";
	import editConfig from "../../components/posts/edit/editConfig.vue";
	import editAccess from "../../components/posts/edit/editAccess.vue";
	import notification from "../../components/notification.vue";
	const user = useUser();
	const router = useRouter();

	const currentTab = ref<"access" | "text" | "config">("access");

	const nodeData = ref<NodeCreationRequest>({
		title: "",
		body: "",
		deletedDraftIndex: undefined,
	});
	const postConfig = ref<PostConfig>({});
	const postAccess = ref<PostAccess>({users: [{name: user.data!.name, id: user.data!.id}]});

	const notifText = ref<string>("");
	function displayError(error: NonNullable<FetchResponse["error"]>) {
		notifText.value = error.message;
	}

	const defaultPresets: UserData["presets"] = [
		{
			name: "Reset Selection",
			config: {},
		},
		{
			name: "Everything",
			config: {
				timestamps: {
					interacted: true,
				},
				votes: {
					up: true,
					down: true,
					anon: true,
				},
			},
		},
	];

	const presetsAtCapacity = computed(() => user.data!.presets.length >= userCaps.presets.max);

	async function savePreset() {
		if (presetsAtCapacity.value) return;

		const newPresetsState = [...user.data!.presets, {name: "", config: deepCloneFromReactive(postConfig.value)!}];

		const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("presets", newPresetsState)]);

		if (response.error) {
			notifText.value = response.error.message;
			return;
		}

		user.data!.presets = newPresetsState;
	}

	async function submitNode() {
		notifText.value = "";

		const response = await apiFetch<Post>(
			"POST",
			"/posts",
			new PostCreationRequest(
				new NodeCreationRequest(nodeData.value.title, nodeData.value.body, nodeData.value.deletedDraftIndex),
				postConfig.value,
				postAccess.value
			)
		);

		if (response.error) {
			notifText.value = response.error.message;
			return;
		}

		if (typeof nodeData.value.deletedDraftIndex === "number") {
			const newDraftsState = deepCloneFromReactive(user.data!.drafts).filter(
				(draft, index) => index !== nodeData.value.deletedDraftIndex
			);
			user.data!.drafts = newDraftsState;
		}

		router.push(router.currentRoute.value.fullPath.replace("create", response.data!.thread.id));
	}
</script>

<style scoped>
	form {
		width: min(calc(100% - 1em), 55em);
		margin: auto;
		padding: 0 0.5em 0.5em;
	}

	.section {
		margin-bottom: 0.25em;
	}

	.section + .section {
		border-top: 0.1em solid var(--textSubColor);
	}

	.sectionTab {
		font-size: 1.5em;
		margin-top: 0.2em;
		transition: font-size 300ms;
	}

	.sectionTab::after {
		content: "v";
		float: right;
		transition: rotate 300ms;
	}

	.section[aria-expanded="true"] .sectionTab::after {
		rotate: 90deg;
	}

	.section[aria-expanded="true"] .sectionTab {
		font-size: 2.25em;
		margin-bottom: 0.2em;
	}

	/* CONFIG */
	.presetButton {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		width: 100%;
		color: var(--textColor);
		background-color: var(--backgroundSubColor);
		border-radius: 0.5em;
		padding: 0.5em 0.75em;
	}
	.presetButton:hover,
	.presetButton:focus {
		color: var(--highlightSubColor);
		outline: none;
	}
	.presetButton:active {
		color: var(--highlightColor);
	}

	.presetButton img {
		height: 2em;
	}
	.presetButton:hover img,
	.presetButton:focus img {
		filter: var(--filterToHighlightSubColor);
		outline: none;
	}
	.presetButton:active img {
		filter: var(--filterToHighlightColor);
	}

	.presetButton span {
		font-size: 1.5em;
	}

	.presetButton + .presetButton {
		margin-top: 0.5em;
	}

	#config > * + * {
		margin-top: 0.5em;
	}

	#config #savePresetButton {
		display: block;
		margin: 0.5em auto;
	}

	/* CONFIRMATION */

	#submitButton {
		width: 100%;
	}

	@media (min-width: 75em) {
		form {
			width: auto;
			max-width: 100em;
			display: grid;
			grid-template-columns: 1fr 2.5fr 1fr;
			grid-template-areas:
				"access texts config"
				"access confirmation config";
			gap: 1em;
		}

		.section + .section {
			border: none;
		}

		#access,
		#texts,
		#config {
			display: block !important;
		}

		#texts {
			grid-area: texts;
		}
		#config {
			grid-area: config;
		}
		#access {
			grid-area: access;
		}
		#confirmation {
			grid-area: confirmation;
		}
	}
</style>

<style>
	@media (min-width: 75em) {
		#createPost .section > button {
			display: none;
		}
	}
</style>

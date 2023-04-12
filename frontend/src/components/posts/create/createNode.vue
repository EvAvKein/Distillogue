<template>
	<form v-if="user.data" @submit.prevent :class="reply ? 'reply' : 'post'">
		<editNode v-model:data="nodeData" id="texts" @error="displayError" />

		<section v-if="!reply" id="configDrawer" :class="configDrawerOpen ? 'open' : ''">
			<button id="drawerToggler" type="button" @click="() => (configDrawerOpen = !configDrawerOpen)">
				<img src="../../../assets/fileConfig.svg" alt="Icon of file with cogwheel" />
			</button>
			<section id="config" :inert="configDrawerExists && !configDrawerOpen">
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
							src="../../../assets/defaultConfig.svg"
							alt="Icon of cogwheel inside a browser window"
						/>
						<img v-else src="../../../assets/customConfig.svg" alt="Icon of cogwheel beside a pencil" />
						<span>{{ preset.name || "[No Title, Edit in Dashboard]" }}</span>
					</button>
				</TransitionGroup>
				<editConfig v-model:config="(postConfig as PostConfig)" id="editConfig" />
				<button
					@click="savePreset"
					type="button"
					id="savePresetButton"
					class="core_borderButton"
					:inert="presetsAtCapacity ? true : false"
				>
					{{ presetsAtCapacity ? "Presets at capacity" : "Save preset" }}
				</button>
			</section>
		</section>

		<section id="confirmation">
			<button id="submitButton" type="button" class="core_backgroundButton" @click="submitNode">
				{{ reply ? "Reply" : "Post" }}
				{{
					typeof nodeData.deletedDraftIndex === "number" ? ` (& delete draft ${nodeData.deletedDraftIndex + 1})` : ""
				}}
			</button>
			<notification v-model:text="notifText" :desirablityStyle="notifDesirability" />
		</section>
	</form>
</template>

<script setup lang="ts">
	import {ref, computed, ComputedRef, onMounted, onUnmounted} from "vue";
	import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";
	import {UserData} from "../../../../../shared/objects/user";
	import {Node, Post, PostConfig} from "../../../../../shared/objects/post";
	import {
		FetchResponse,
		NodeCreationRequest,
		NodeInteractionRequest,
		PostCreationRequest,
		UserPatchRequest,
	} from "../../../../../shared/objects/api";
	import {apiFetch} from "../../../helpers/apiFetch";
	import {user as userCaps} from "../../../../../shared/objects/validationUnits";
	import {useUser} from "../../../stores/user";
	import {useRouter} from "vue-router";
	import editNode from "./editNode.vue";
	import editConfig from "./config/editConfig.vue";
	import notification from "../../notification.vue";
	const user = useUser();
	const router = useRouter();

	const props = defineProps<{
		reply?: {nodePath: Node["id"][] | null};
	}>();

	const nodeData = ref<NodeCreationRequest>({
		title: "",
		body: "",
		deletedDraftIndex: undefined,
	});
	const postConfig = ref<PostConfig | undefined>(props.reply ? undefined : {});

	const notifText = ref<string>("");
	const notifDesirability = ref<boolean>(true);
	function displayError(error: NonNullable<FetchResponse["error"]>) {
		notifText.value = error.message;
		notifDesirability.value = false;
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

	const configDrawerExists = ref<boolean | undefined>(undefined);
	const configDrawerOpen = ref<boolean | null>(props.reply ? null : false);

	let presetsAtCapacity: ComputedRef<boolean>;

	let savePreset: () => void;
	if (!props.reply) {
		presetsAtCapacity = computed(() => user.data!.presets.length >= userCaps.presets.max);
		savePreset = async () => {
			if (presetsAtCapacity.value) return;

			const newPresetsState = [...user.data!.presets, {name: "", config: deepCloneFromReactive(postConfig.value)!}];

			const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("presets", newPresetsState)]);

			if (response.error) {
				notifText.value = response.error.message;
				notifDesirability.value = false;
				return;
			}

			user.data!.presets = newPresetsState;
		};

		const body = document.getElementsByTagName("body")[0];
		function configInertByScreenWidth() {
			const pxFontSize = Number.parseInt(window.getComputedStyle(body).fontSize);
			configDrawerExists.value = body.clientWidth < pxFontSize * 55;
		}
		onMounted(() => {
			configInertByScreenWidth();
			const bodyObserver = new ResizeObserver(configInertByScreenWidth);
			bodyObserver.observe(body);
			onUnmounted(() => {
				bodyObserver.disconnect();
			});
		});
	}

	async function submitNode() {
		notifText.value = "";

		const apiRequest = props.reply
			? () => {
					return apiFetch(
						"POST",
						"/posts/interactions",
						new NodeInteractionRequest(
							props.reply!.nodePath!,
							"reply",
							new NodeCreationRequest(nodeData.value.title, nodeData.value.body, nodeData.value.deletedDraftIndex)
						)
					);
			  }
			: () => {
					return apiFetch(
						"POST",
						"/posts",
						new PostCreationRequest(
							new NodeCreationRequest(nodeData.value.title, nodeData.value.body, nodeData.value.deletedDraftIndex),
							postConfig.value!,
							{users: [{name: user.data!.name, id: user.data!.id}], ...postConfig.value!.access}
						)
					);
			  };
		const response = await apiRequest();

		if (response.error) {
			notifText.value = response.error.message;
			notifDesirability.value = false;
			return;
		}

		if (typeof nodeData.value.deletedDraftIndex === "number") {
			const newDraftsState = deepCloneFromReactive(user.data!.drafts).filter(
				(draft, index) => index !== nodeData.value.deletedDraftIndex
			);
			user.data!.drafts = newDraftsState;
		}

		props.reply
			? router.go(0)
			: router.push(router.currentRoute.value.fullPath.replace("create", (response.data as Post).thread.id));
	}
</script>

<style scoped>
	form {
		display: grid;
		position: relative;
		overflow: hidden;
		margin: auto;
		width: min(calc(100% - 1em), 70em);
		padding: 0 0.5em 0.5em;
		grid-template-columns: 1fr 3.25em;
		grid-template-areas:
			"texts config"
			"confirmation .";
		gap: 0.5em 0.25em;
	}

	form.reply {
		display: block;
		padding: 0.25em 0.5em;
	}

	/* TEXTS */

	#texts {
		grid-area: texts;
	}

	/* CONFIG */

	#configDrawer {
		grid-area: config;
		position: absolute;
		height: 100%;
		top: 0;
		right: -17.5em;
		width: max-content;
		border-radius: 1em 0 0 1em;
		transition: right 0.5s;
	}
	#configDrawer.open {
		right: -0.5em;
	}

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

	#config {
		display: inline-block;
		height: 100%;
		width: 17em;
		padding: 0.5em;
		box-sizing: border-box;
		scrollbar-gutter: stable;
		padding-right: 0.25em;
		border-width: 0.25em 0;
		border-style: solid;
		border-color: var(--textColor);
		overflow: auto;
		background-color: var(--backgroundColor);
	}
	#config > * + * {
		margin-top: 0.5em;
	}

	#config #savePresetButton {
		display: block;
		margin: 0.5em auto;
	}

	#drawerToggler {
		background-color: var(--textColor);
		height: 100%;
		width: 3.25em;
		padding: 0;
		margin-right: 0;
		border-radius: 1em 0 0 1em;
		vertical-align: top;
	}
	#drawerToggler img {
		width: 2.75em;
		filter: var(--filterToBackgroundColor);
	}

	#drawerToggler,
	#config {
		transition: all 300ms;
	}
	#drawerToggler:hover,
	#drawerToggler:focus {
		outline: none;
		background-color: var(--highlightSubColor);
	}
	#drawerToggler:hover + #config,
	#drawerToggler:focus + #config {
		border-color: var(--highlightSubColor);
	}
	#drawerToggler:active {
		background-color: var(--highlightColor);
	}
	#drawerToggler:active + #config {
		border-color: var(--highlightColor);
	}

	/* CONFIRMATION */

	#confirmation {
		grid-area: confirmation;
	}

	#submitButton {
		width: 100%;
	}

	@media (min-width: 55rem) {
		form {
			grid-template-columns: 1fr auto;
			grid-template-rows: min-content 100%;
			grid-template-areas:
				"texts config"
				"confirmation config";
			gap: 0.5em;
		}

		#configDrawer {
			position: initial;
			height: max-content;
		}
		#drawerToggler {
			display: none;
		}
		#config {
			padding: 0;
			border: none;
		}
	}
</style>

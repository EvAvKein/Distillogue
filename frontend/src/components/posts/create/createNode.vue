<template>
	<form v-if="user.data" @submit.prevent>
		<section id="texts">
			<section v-if="user.data.drafts" id="drafts">
				<TransitionGroup name="collapse">
					<button
						v-for="(draft, index) in user.data.drafts"
						:key="draft.title + index"
						type="button"
						class="core_backgroundButton draftButton"
						@click="selectDraft(index)"
					>
						{{ draft.title || "[No Title]" }}
					</button>
					<button
						v-if="typeof currentDraftIndex === 'number'"
						id="preserveDraftButton"
						type="button"
						class="core_backgroundButton"
						@click="selectDraft(null)"
					>
						Preserve draft {{ currentDraftIndex + 1 }}
					</button>
				</TransitionGroup>
			</section>
			<labelledInput
				id="title"
				:label="'Title'"
				:type="'text'"
				:required="true"
				:inputId="'nodeTitle'"
				v-model="nodeTitle"
			/>
			<labelledInput
				:label="'Body'"
				:type="'textarea'"
				:minLineHeight="15"
				:required="true"
				:inputId="'nodeBody'"
				v-model="nodeBody"
			/>
		</section>

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
					class="core_backgroundButton"
					:inert="presetsAtCapacity ? true : false"
				>
					{{ presetsAtCapacity ? "Presets at capacity" : "Save preset" }}
				</button>
			</section>
		</section>

		<section id="confirmation">
			<div>
				<button id="saveDraft" type="button" class="core_backgroundButton" :inert="draftsAtCapacity" @click="saveDraft">
					{{ draftsAtCapacity ? "Drafts at capacity" : "Save draft" }}
				</button>
				<button id="submitButton" type="button" class="core_backgroundButton" @click="submitNode">
					{{ reply ? "Reply" : "Post" }}
					{{ typeof currentDraftIndex === "number" ? ` (& delete draft ${currentDraftIndex + 1})` : "" }}
				</button>
			</div>
			<notification v-model:text="notifText" :desirablityStyle="notifDesirability" />
		</section>
	</form>
</template>

<script setup lang="ts">
	import {ref, computed, ComputedRef, onMounted, onUnmounted} from "vue";
	import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";
	import {UserData} from "../../../../../shared/objects/user";
	import {Node, PostConfig} from "../../../../../shared/objects/post";
	import {NodeCreationRequest, NodeInteractionRequest, UserPatchRequest} from "../../../../../shared/objects/api";
	import {unix} from "../../../../../shared/helpers/timestamps";
	import {apiFetch} from "../../../helpers/apiFetch";
	import {user as userCaps} from "../../../../../shared/objects/validationUnits";
	import {useUser} from "../../../stores/user";
	import {useRouter} from "vue-router";
	import labelledInput from "../../labelledInput.vue";
	import editConfig from "./config/editConfig.vue";
	import notification from "../../notification.vue";
	const user = useUser();
	const router = useRouter();

	const props = defineProps<{
		reply?: {nodePath: Node["id"][] | null};
	}>();

	const nodeTitle = ref<Node["title"]>("");
	const nodeBody = ref<Node["body"]>("");
	const currentDraftIndex = ref<number | null>(null);

	const notifText = ref<string>("");
	const notifDesirability = ref<boolean>(true);

	const postConfig = ref<PostConfig | undefined>(props.reply ? undefined : {});
	const postInvitedOwners = ref<UserData["id"][] | undefined>(props.reply ? undefined : []);

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

	function selectDraft(index: number | null) {
		currentDraftIndex.value = index;
		if (index === null) {
			currentDraftIndex.value = null;
			return;
		}

		const {title, body} = deepCloneFromReactive(user.data!.drafts[index]);
		nodeTitle.value = title;
		nodeBody.value = body;
		currentDraftIndex.value = index;
	}

	const draftsAtCapacity = computed(() => user.data!.drafts.length >= userCaps.drafts.max);
	async function saveDraft() {
		if (draftsAtCapacity.value) return;

		const newDraftsState = [
			...deepCloneFromReactive(user.data!.drafts),
			{title: nodeTitle.value, body: nodeBody.value, lastEdited: unix()},
		];

		const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("drafts", newDraftsState)]);

		if (response.error) {
			notifText.value = response.error.message;
			notifDesirability.value = false;
			return;
		}

		user.data!.drafts = newDraftsState;
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
							new NodeCreationRequest(
								[user.data!.id],
								nodeTitle.value,
								nodeBody.value,
								currentDraftIndex.value || undefined,
								undefined,
								props.reply!.nodePath!
							)
						)
					);
			  }
			: () => {
					return apiFetch(
						"POST",
						"/posts",
						new NodeCreationRequest(
							postInvitedOwners!.value,
							nodeTitle.value,
							nodeBody.value,
							currentDraftIndex.value || undefined,
							postConfig!.value
						)
					);
			  };
		const response = await apiRequest();

		if (response.error) {
			notifText.value = response.error.message;
			notifDesirability.value = false;
			return;
		}

		if (typeof currentDraftIndex.value === "number") {
			const newDraftsState = deepCloneFromReactive(user.data!.drafts).filter(
				(draft, index) => index !== currentDraftIndex.value
			);
			user.data!.drafts = newDraftsState;
		}

		props.reply
			? router.go(0)
			: router.push(router.currentRoute.value.fullPath.replace("create", (response.data as Node).id));
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

	/* TEXTS */

	#texts {
		grid-area: texts;
		font-size: clamp(1.25em, 2.25vw, 1.5em);
	}

	#drafts {
		margin-bottom: 0.5em;
	}

	#drafts button {
		width: 100%;
		padding: 0.2em;
		font-weight: bold;
	}

	#drafts #preserveDraftButton {
		display: block;
		width: 90%;
		margin-inline: auto;
		font-size: 0.9em;
		font-weight: normal;
	}

	#drafts button + button {
		margin-top: 0.25em;
	}

	#texts #title {
		font-size: 1.15em;
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

	#confirmation div {
		display: flex;
		flex-wrap: nowrap;
		gap: 0.5em;
	}

	#submitButton {
		flex-grow: 1;
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

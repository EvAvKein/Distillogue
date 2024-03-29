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
					<editAccess v-model:access="postAccess" id="access" />
				</template>
			</animatedCollapsible>

			<animatedCollapsible :forcedState="{state: currentTab === 'text'}" @toggle="currentTab = 'text'" class="section">
				<template #summary>
					<div class="sectionTab">Text</div>
				</template>
				<template #content>
					<editNode v-model:data="nodeData" id="texts" />
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
						<button class="presetButton" type="button" @click="postConfig = {}">
							<img src="../../assets/reset.svg" alt="Arrow looping back towards itself, forming a circle" />
							<span>Reset Selection</span>
						</button>
						<ul>
							<TransitionGroup name="collapse">
								<li>
									<button
										v-for="(preset, index) in user.data!.presets"
										:key="preset.name + index"
										class="presetButton"
										type="button"
										@click="postConfig = deepCloneFromReactive(preset.config)"
									>
										<img src="../../assets/fileConfig.svg" alt="Icon of a paper with a cogwheel" />
										<span>{{ preset.name || "[No Title, Edit in Dashboard]" }}</span>
									</button>
								</li>
							</TransitionGroup>
						</ul>
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
			</section>
		</form>
	</main>
</template>

<script setup lang="ts">
	import {ref, computed} from "vue";
	import {deepCloneFromReactive} from "../../helpers/deepCloneFromReactive";
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
	import {useNotifications} from "../../stores/notifications";
	import animatedCollapsible from "../../components/animatedCollapsible.vue";
	import editNode from "../../components/posts/edit/editNode.vue";
	import editConfig from "../../components/posts/edit/editConfig.vue";
	import editAccess from "../../components/posts/edit/editAccess.vue";
	const user = useUser();
	const router = useRouter();
	const notifs = useNotifications();

	const currentTab = ref<"access" | "text" | "config">("access");

	const nodeData = ref<NodeCreationRequest>({
		title: "",
		body: "",
		deletedDraftIndex: undefined,
	});
	const postConfig = ref<PostConfig>({});
	const postAccess = ref<PostAccess>({
		users: [{name: user.data!.name, id: user.data!.id, roles: []}],
	});

	const presetsAtCapacity = computed(() => user.data!.presets.length >= userCaps.presets.max);

	async function savePreset() {
		if (presetsAtCapacity.value) return;

		const newPresetsState = [...user.data!.presets, {name: "", config: deepCloneFromReactive(postConfig.value)!}];

		const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("presets", newPresetsState)]);

		if (response.error) {
			notifs.create(response.error.message, false);
			return;
		}

		user.data!.presets = newPresetsState;
	}

	async function submitNode() {
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
			notifs.create(response.error.message, false, true);
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
		transition: rotate 300ms, transform 100ms;
	}

	.section[aria-expanded="true"] .sectionTab::after {
		rotate: 90deg;
		transform: translateY(0.1em); /* prevents rightward overflow (and therefore scrollbar) on thin enough viewports */
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

	@media (min-width: 90em) {
		form {
			width: auto;
			max-width: 110em;
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
			border-inline: 0.01em solid var(--textSubColor);
			padding-inline: 0.5em;
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
	@media (min-width: 90em) {
		#createPost .section > button {
			display: none;
		}
	}
</style>

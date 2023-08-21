<template>
	<section>
		<notification :text="notif.text" :desirablityStyle="notif.desirability" />
		<ul id="sessions">
			<transition-group name="collapse">
				<li v-for="(session, index) of sessions" :key="session.latestUsed">
					<editableText
						class="sessionName"
						:initialValue="session.name"
						:minLength="val.sessions.name.min"
						:maxLength="val.sessions.name.max"
						:placeholder="'Session name'"
						@edit="(newName) => renameSession(newName, index)"
					/>
					<timestamp class="latestUsed" :pastUnix="session.latestUsed" />
					<button
						v-if="currentSessionKey !== session.key"
						class="deleteSession core_contentButton"
						@click="() => deleteSession(index)"
					>
						<img src="../../../assets/trash.svg" alt="Trash icon" />
					</button>
					<img
						v-else
						id="currentSession"
						title="Current session"
						src="../../../assets/userWithoutPfp.svg"
						alt="User icon"
					/>
				</li>
			</transition-group>
		</ul>
	</section>
</template>

<script setup lang="ts">
	import {ref, onMounted} from "vue";
	import {apiFetch} from "../../../helpers/apiFetch";
	import {UserSession} from "../../../../../shared/objects/user";
	import {user as val} from "../../../../../shared/objects/validationUnits";
	import timestamp from "../../../components/timestamp.vue";
	import notification from "../../../components/notification.vue";
	import editableText from "../../../components/editableText.vue";
	import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";

	const sessions = ref<UserSession[] | undefined>();
	const currentSessionKey = ref<string>(localStorage.getItem("sessionKey") ?? "");

	onMounted(async () => {
		sessions.value = (await apiFetch<UserSession[]>("GET", "/sessions")).data;
	});

	const notif = ref({
		text: "",
		desirability: null as boolean | null,
	});

	async function renameSession(newName: string, sessionIndex: number) {
		const renamedSession = deepCloneFromReactive(sessions.value![sessionIndex]);
		renamedSession.name = newName;

		const response = await apiFetch<UserSession[]>("PATCH", "/sessions", renamedSession);
		if (response.error) {
			notif.value.text = response.error.message;
			notif.value.desirability = false;
			return;
		}

		sessions.value = response.data;
	}

	async function deleteSession(deletionIndex: number) {
		notif.value.text = "";

		const response = await apiFetch<UserSession[]>("DELETE", "/sessions", sessions.value![deletionIndex]);
		if (response.error) {
			notif.value.text = response.error.message;
			notif.value.desirability = false;
			return;
		}

		sessions.value = sessions.value!.filter((s, i) => i !== deletionIndex);
	}
</script>

<style scoped>
	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1em;
	}

	.sessionName {
		width: clamp(4em, 40%, 15em);
	}

	.latestUsed {
		color: var(--textSubColor);
	}

	.deleteSession,
	#currentSession {
		height: 1.1em;
	}

	#currentSession {
		filter: var(--filterToTextSubColor);
	}

	li + li {
		margin-top: 0.5em;
	}
</style>

<template>
	<section id="postInfo">
		<h1>{{ post.thread.title }}</h1>

		<section id="postStats">
			<div class="pill">Posted: <timestamp :pastUnix="post.stats.posted" /></div>
			<div class="pill" v-if="post.stats.interacted">Interacted: <timestamp :pastUnix="post.stats.interacted" /></div>
		</section>

		<section id="usersConfigWrapper">
			<section id="postUsers">
				<section v-if="selfIsModerator" id="userAddition">
					<div>
						<labelledInput inputId="extraUserName" type="Name" v-model="userAddition.name" />
						<labelledInput inputId="extraUserId" type="ID" v-model="userAddition.id" />
						<select
							v-if="self.data?.contacts"
							id="contactSelect"
							@input="(event) => {
								const elem = event.target as HTMLSelectElement;
								const contactId = elem.value as PostUserRole;
								if (!contactId) return;
								userAddition = self.data!.contacts.find((contact) => contact.id = contactId)!
							}"
						>
							<option value="">Select Contact</option>
							<option v-for="contact in self.data.contacts" :value="contact.id">{{ contact.name }}</option>
						</select>
					</div>
					<!-- would be nice to have role selection here too but it's low-priority, TODO -->
					<button
						class="core_backgroundButton"
						type="button"
						@click="
							updateAccess({
								...props.post.access,
								users: post.access.users.concat([{...userAddition, roles: []}]),
							})
						"
					>
						+
					</button>
				</section>
				<ul>
					<li v-for="(user, userIndex) in post.access.users">
						<collapsible>
							<template #summary>
								<span>{{ user.name }}</span>
								<ul class="userRoles">
									<li v-for="role in user.roles" class="pill">
										<span>{{ role }}</span>
										<button
											v-if="moderationInputs && selfIsModerator"
											class="roleRemoval"
											type="button"
											@click="
												(event) => {
													event.stopPropagation();
													updateAccess({
														...props.post.access,
														users: usersAfterRoleUpdate(userIndex, role, false),
													});
												}
											"
										>
											X
										</button>
									</li>
									<li v-if="moderationInputs && selfIsModerator">
										<select
											class="roleSelect pill"
											@click="(event) => event.stopPropagation()"
											@input="(event) => {
												const elem = event.target as HTMLSelectElement;
												const selectedRole = elem.value as PostUserRole;
												elem.value = '';
												if (!selectedRole) return;
												updateAccess({
													...props.post.access,
													users: usersAfterRoleUpdate(userIndex, selectedRole, true),
												});
											}
										"
										>
											<option value=""><div id="rolePlus">+</div></option>
											<option
												v-for="role of arrOfPostUserRoles.filter((possibleRole) => !user.roles.includes(possibleRole))"
												:value="role"
											>
												{{ role }}
											</option>
										</select>
									</li>
								</ul>
							</template>
							<template #content>
								<div class="userExtras">
									<div class="userId">{{ user.id }}</div>
									<button
										v-if="moderationInputs && selfIsModerator && user.id !== self.data?.id"
										class="userRemoval core_contentButton"
										type="button"
										@click="
											updateAccess({
												...props.post.access,
												users: props.post.access.users.filter((user, index) => index !== userIndex),
											})
										"
									>
										X
									</button>
								</div>
							</template>
						</collapsible>
					</li>
				</ul>
			</section>

			<hr v-if="configIsntBlank" />

			<section id="postConfig" v-if="configIsntBlank">
				<div v-for="(category, categoryKey) in post.config" class="configCategory">
					<h3>{{ postConfigReadable[categoryKey].name }}</h3>
					<ul>
						<li v-for="([settingKey, setting]) in Object.entries(category!)">
							{{
								(postConfigReadable[categoryKey].props as mappedConfigCategory)[settingKey as subkeyOfPostConfig].name
							}}
							<span v-if="setting !== true">: {{ setting }}</span>
							<!-- span hasn't been styled or tested yet, pending applicable setting -->
						</li>
					</ul>
				</div>
			</section>
		</section>
	</section>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {Post, PostAccess} from "../../../../../shared/objects/post";
	import {postConfigReadable, subkeyOfPostConfig, mappedConfigCategory} from "../../../helpers/postConfigReadable";
	import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";
	import {PostUserRole, arrOfPostUserRoles} from "../../../../../shared/objects/user";
	import {apiFetch} from "../../../helpers/apiFetch";
	import {useUser} from "../../../stores/user";
	import {useNotifications} from "../../../stores/notifications";
	import timestamp from "../../timestamp.vue";
	import collapsible from "../../animatedCollapsible.vue";
	import labelledInput from "../../labelledInput.vue";

	const self = useUser();
	const notifs = useNotifications();

	const props = defineProps<{
		post: Post;
		moderationInputs?: true;
	}>();

	const emit = defineEmits(["postUpdate"]);

	const selfIsModerator = ref(
		Boolean(
			props.post.access.users.filter((user) => user.id === self.data?.id && user.roles.includes("Moderator")).length
		)
	);

	const userAddition = ref({name: "", id: ""});

	const configIsntBlank = ref(Boolean(Object.keys(props.post.config).length));

	function usersAfterRoleUpdate(userIndex: number, role: PostUserRole, newStatus: boolean) {
		const users = deepCloneFromReactive(props.post.access.users);
		let userRoles = users[userIndex].roles;
		userRoles = newStatus ? userRoles.concat([role]) : userRoles.filter((subjectRole) => subjectRole !== role);

		users[userIndex].roles = userRoles;
		return users;
	}

	async function updateAccess(newAccess?: PostAccess) {
		const response = await apiFetch("PATCH", "/posts/" + props.post.thread.id, {access: newAccess});

		if (response.error) {
			notifs.create(response.error.message, false);
			return;
		}

		emit("postUpdate", response.data as Post);
	}
</script>

<style scoped>
	#postInfo {
		padding: 1em;
		overflow: auto;
	}

	#postInfo::-webkit-scrollbar-track {
		background-color: transparent;
	}
	#postInfo::-webkit-scrollbar-corner {
		background-color: var(--backgroundSubColor);
	}

	h1 {
		font-size: 2em;
	}

	#postStats {
		margin-top: 0.75em;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
	}

	.pill {
		text-wrap: nowrap;
		border-radius: 0.5em;
		padding: 0.25em 0.5em;
		color: var(--backgroundSubColor);
		background-color: var(--textSubColor);
	}

	#usersConfigWrapper {
		margin-top: 0.75em;
		border-top: 0.2em solid var(--textSubColor);
		display: flex;
		flex-direction: column;
	}

	hr {
		margin: 0;
		border: 0.1em solid var(--textSubColor);
	}

	#postUsers,
	#postConfig {
		margin: 0.5em;
	}

	#userAddition {
		display: flex;
		margin-bottom: 0.25em;
	}

	#userAddition div {
		display: inline-block;
		flex-grow: 1;
	}
	#userAddition div > * {
		display: block;
	}

	#userAddition select {
		display: block;
		appearance: none;
		border: none;
		font-size: 1.25em;
		color: var(--textSubColor);
		background-color: var(--backgroundColor);
		box-sizing: border-box;
		width: 100%;
		padding: 0.25em;
	}

	.userRoles {
		display: inline-flex;
		align-items: center;
		margin-left: 0.25em;
		gap: 0.25em;
		text-wrap: nowrap;
	}

	.userRoles button {
		padding: 0;
		background-color: transparent;
		padding-left: 0.25em;
		border-left: 0.1em solid var(--backgroundSubColor);
		margin-left: 0.25em;
	}

	.userRoles button:hover,
	.userRoles button:focus {
		color: red;
	}

	.userRoles select {
		appearance: none;
		border: none;
		color: var(--backgroundSubColor);
		background-color: var(--textSubColor);
		text-align: center;
		font-weight: bold;
		font-size: 1.25em;
		box-sizing: content-box;
		line-height: 0.75em;
		width: 0.6em;
		height: 0.75em;
		padding: 0.3em 0.4em 0.25em;
	}
	.userRoles select option {
		font-weight: initial;
		font-size: 1em;
	}

	#postUsers > ul > li + li {
		margin-top: 0.25em;
	}

	.userExtras {
		margin-top: 0.25em;
		display: flex;
		justify-content: space-between;
		gap: 0.5em;
	}

	.userId {
		color: var(--textSubColor);
	}

	.configCategory + .configCategory {
		margin-top: 0.5em;
	}

	#postConfig ul {
		list-style: initial;
	}
	#postConfig li {
		margin-left: 1.5em;
	}

	@media (min-width: 35em) {
		h1 {
			text-align: center;
		}

		#postStats {
			justify-content: center;
		}

		#usersConfigWrapper {
			flex-direction: row;
			justify-content: center;
		}
	}
</style>

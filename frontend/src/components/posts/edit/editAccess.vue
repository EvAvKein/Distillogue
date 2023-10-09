<template>
	<section id="editAccessWrapper">
		<div id="userAdditionSection">
			<labelledInput :inputId="'userAdditionName'" :type="'text'" :label="'Name'" v-model="newUser.name" />
			<labelledInput :inputId="'userAdditionId'" :type="'text'" :label="'ID'" v-model="newUser.id" />
			<select
				v-if="user.data?.contacts.length"
				id="userAdditionContact"
				class="core_crudeInput"
				@change="setUserAdditionInputsBySelection"
			>
				<option>-- Load contact --</option>
				<option v-for="({name, id}, index) of user.data?.contacts" :value="index">
					{{ name }} <span>({{ id }})</span>
				</option>
			</select>
			<button
				id="userAdditionConfirm"
				class="core_borderButton"
				type="button"
				@click="
					() => {
						updateAccess(
							'users',
							access.users.filter((user) => user.id !== newUser.id).concat([deepCloneFromReactive(newUser)])
						);
					}
				"
			>
				Add
			</button>
		</div>

		<section id="accessTableWrapper">
			<table>
				<thead>
					<tr>
						<th>User</th>
						<th title="Moderator">Mod</th>
						<th aria-label="Delete" v-if="access.users.length > 1"></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="({name, id}, index) of access.users" :key="id + index">
						<td>
							<animatedCollapsible class="userInfoCollapsible">
								<template #summary>
									{{ name }}
								</template>
								<template #content>
									<div>{{ id }}</div>
								</template>
							</animatedCollapsible>
						</td>
						<td>
							<input
								:key="id + index + 'checkbox'"
								type="checkbox"
								class="core_crudeInput userModCheckbox"
								:checked="access.users[index].roles.includes('Moderator')"
								@click="(event) => {
									updateAccess(
										'users',
										usersAfterRoleEdit(
											index,
											(event.currentTarget as HTMLInputElement).checked
												? access.users[index].roles.concat(['Moderator'])
												: access.users[index].roles.filter((role) => role !== 'Moderator')
										)
									)
								}"
							/>
						</td>
						<td v-if="access.users.length > 1">
							<button
								v-if="id !== user.data?.id"
								class="core_contentButton userDeletionButton"
								type="button"
								@click="
									updateAccess(
										'users',
										access.users.filter((user, uIndex) => uIndex !== index)
									)
								"
							>
								<img src="../../../assets/trash.svg" alt="Trash icon" />
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</section>
	</section>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";
	import {PostAccess} from "../../../../../shared/objects/post";
	import {PostUserEntry} from "../../../../../shared/objects/user";
	import {useUser} from "../../../stores/user";
	import labelledInput from "../../labelledInput.vue";
	import animatedCollapsible from "../../animatedCollapsible.vue";
	const user = useUser();

	const props = defineProps<{
		access: PostAccess;
	}>();

	const emit = defineEmits(["update:access"]);

	const newUser = ref<PostUserEntry>({name: "", id: "", roles: []});

	function setUserAdditionInputsBySelection(event: Event) {
		const contact = user.data!.contacts[Number((event.target as HTMLInputElement).value)]!;
		newUser.value.name = contact.name;
		newUser.value.id = contact.id;
	}

	function usersAfterRoleEdit(userIndex: number, newRoleState: PostUserEntry["roles"]) {
		const users = props.access.users;
		users[userIndex].roles = newRoleState;
		return users;
	}

	function updateAccess<P extends keyof PostAccess>(property: P, newValue: PostAccess[P]) {
		const access = props.access;
		newValue ? (access[property] = newValue) : delete access[property];
		emit("update:access", access);
	}
</script>

<style scoped>
	section {
		text-align: center;
		font-size: 1.25em;
	}

	#userAdditionSection {
		display: grid;
		gap: 0.5em;
		grid-template-columns: 1fr min-content;
		grid-template-areas:
			"nameInput confirmAddition"
			"idInput confirmAddition"
			"contactSelect confirmAddition";
	}

	#userAdditionName {
		grid-area: nameInput;
	}

	#userAdditionId {
		grid-area: idInput;
	}

	#userAdditionSection select {
		grid-area: contactSelect;
	}

	#userAdditionSection button {
		grid-area: confirmAddition;
	}

	select,
	option {
		font-size: inherit;
		color: var(--textColor);
		background-color: var(--backgroundColor);
		border: 0.1em solid var(--textColor);
		border-radius: 0.25em;
	}

	option span {
		color: var(--textSubColor);
	}

	#accessTableWrapper {
		overflow-x: auto;
		overflow-y: hidden;
	}

	table {
		width: 100%;
		margin-top: 0.5em;
		border-collapse: collapse;
	}

	tbody tr {
		border-top: 0.05em solid var(--textSubColor);
	}

	th:not(:first-child),
	td:not(:first-child) {
		border-left: 0.05em solid var(--textSubColor);
		width: 1em;
	}

	th {
		font-size: 1.1em;
	}

	th[title] {
		cursor: help;
	}

	td {
		font-size: 0.8em;
	}

	th,
	td {
		padding: 0.25em 0.5em;
	}

	td div {
		font-size: 0.7em;
		color: var(--textSubColor);
		user-select: all;
	}

	td input[type="checkbox"] {
		transform: scale(1.25);
	}

	td button,
	td button image {
		vertical-align: middle;
		height: 1.25em;
	}
</style>

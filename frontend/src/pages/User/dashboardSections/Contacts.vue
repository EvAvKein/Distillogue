<template>
	<section>
		<section>
			<labelledInput :label="'Name'" :inputId="'newContactName'" :type="'text'" v-model="newContactName" />
			<labelledInput
				id="newContactIdWrapper"
				:label="'ID'"
				:inputId="'newContactId'"
				:type="'text'"
				v-model="newContactId"
			/>
			<button id="newContactButton" class="core_backgroundButton" @click="createNewContact">New contact</button>
		</section>
		<ul>
			<transition-group name="collapse">
				<li v-for="(contact, index) of user.data!.contacts">
					<animatedCollapsible>
						<template #summary>
							{{ contact.name }}
						</template>
						<template #content>
							<div>
								{{ contact.id }}
								<button class="deleteContactButton core_contentButton" @click="() => deleteContact(index)">
									<img src="../../../assets/trash.svg" alt="Trash icon" />
								</button>
							</div>
						</template>
					</animatedCollapsible>
				</li>
			</transition-group>
		</ul>
	</section>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {apiFetch} from "../../../helpers/apiFetch";
	import {UserPatchRequest} from "../../../../../shared/objects/api";
	import {useUser} from "../../../stores/user";
	import {useNotifications} from "../../../stores/notifications";
	import animatedCollapsible from "../../../components/animatedCollapsible.vue";
	import labelledInput from "../../../components/labelledInput.vue";
	const user = useUser();
	const notifs = useNotifications();

	const newContactName = ref("");
	const newContactId = ref("");

	function createNewContact() {
		const contactsWithNew = [{name: newContactName.value, id: newContactId.value}, ...user.data!.contacts];
		updateContacts(contactsWithNew);
	}

	function deleteContact(deletionIndex: number) {
		const contactsAfterDeletion = user.data!.contacts.filter((contact, index) => index !== deletionIndex);
		updateContacts(contactsAfterDeletion);
	}

	async function updateContacts(newContactsState: NonNullable<typeof user.data>["contacts"]) {
		const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("contacts", newContactsState)]);

		if (response.error) {
			notifs.create(response.error.message, false);
			return;
		}
		user.data!.contacts = newContactsState;
	}
</script>

<style scoped>
	#newContactIdWrapper {
		margin-top: 0.5em;
	}

	#newContactButton {
		display: block;
		font-size: 0.9em;
		width: 90%;
		margin: 0.5em auto 0;
		padding: 0.3em;
	}

	ul {
		margin-top: 0.5em;
	}

	li {
		font-size: 1.25em;
		padding-right: 1em;
	}

	li div {
		position: relative;
		font-size: 0.8em;
		color: var(--textSubColor);
		user-select: all;
	}

	.deleteContactButton {
		position: absolute;
		height: 1.1em;
		bottom: 0;
		right: 0;
	}

	li + li {
		margin-top: 0.5em;
	}
</style>

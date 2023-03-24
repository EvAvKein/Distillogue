<template>
	<section>
		<section>
			<labelledInput :label="'Name'" :inputId="'newContactName'" :type="'text'" v-model="newContactName" />
			<labelledInput :label="'ID'" :inputId="'newContactId'" :type="'text'" v-model="newContactId" />
			<button id="newContactButton" class="core_backgroundButton" @click="createNewContact">New contact</button>
			<notification :text="notif.text" :desirablityStyle="notif.desirability" />
		</section>
		<ul>
			<transition-group name="collapse">
				<li v-for="(contact, index) of user.data!.contacts">
					<animatedDetails>
						<template #summary>
							{{ contact.name }}
						</template>
						<template #content>
							<div>{{ contact.id }}</div>
						</template>
					</animatedDetails>
					<button class="deleteContactButton core_contentButton" @click="() => deleteContact(index)">
						<img src="../../../assets/trash.svg" alt="Trash icon" />
					</button>
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
	import animatedDetails from "../../animatedDetails.vue";
	import labelledInput from "../../labelledInput.vue";
	import notification from "../../notification.vue";
	const user = useUser();

	const newContactName = ref("");
	const newContactId = ref("");

	const notif = ref({
		text: "",
		desirability: null as boolean | null,
	});

	function createNewContact() {
		const contactsWithNew = [{name: newContactName.value, id: newContactId.value}, ...user.data!.contacts];
		updateContacts(contactsWithNew);
	}

	function deleteContact(deletionIndex: number) {
		const contactsAfterDeletion = user.data!.contacts.filter((contact, index) => index !== deletionIndex);
		updateContacts(contactsAfterDeletion);
	}

	async function updateContacts(newContactsState: NonNullable<typeof user.data>["contacts"]) {
		notif.value.text = "";

		const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("contacts", newContactsState)]);

		if (response.error) {
			notif.value.text = response.error.message;
			notif.value.desirability = false;
			return;
		}
		user.data!.contacts = newContactsState;
	}
</script>

<style scoped>
	#newContactButton {
		display: block;
		font-size: 0.9em;
		width: 90%;
		margin: 0.5em auto 0;
		padding: 0.3em;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		position: relative;
		font-size: 1.25em;
		padding-right: 1em;
	}

	.deleteContactButton {
		display: none;
		position: absolute;
		height: 1em;
		top: 0;
		right: 0;
	}

	li:focus-within .deleteContactButton {
		display: block;
	}

	li div {
		font-size: 0.8em;
		color: var(--textSubColor);
		user-select: all;
	}

	li + li {
		margin-top: 0.5em;
	}
</style>

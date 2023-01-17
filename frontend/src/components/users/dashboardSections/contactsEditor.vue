<template>
	<section>
		<section>
			<labelledInput :label="'Name'" :inputId="'newContactName'" :type="'text'" v-model="newContactName" />
			<labelledInput :label="'User ID'" :inputId="'newContactId'" :type="'text'" v-model="newContactId" />
			<button id="newContactButton" class="core_backgroundButton" @click="createNewContact">New contact</button>
		</section>
		<ul>
			<transition-group name="collapse">
				<li v-for="(contact, index) of contactsState">
					<animatedDetails>
						<template #summary>
							{{ contact.name }}
						</template>
						<template #content>
							<div>{{ contact.id }}</div>
						</template>
					</animatedDetails>
					<button class="deleteContactButton core_contentButton" @click="() => deleteCurrentContact(index)">
						<img src="../../../assets/trash.svg" alt="Trash icon" />
					</button>
				</li>
			</transition-group>
		</ul>
	</section>
</template>

<script setup lang="ts">
	import {ref, toRaw} from "vue";
	import labelledInput from "../../labelledInput.vue";
	import {UserPatchRequest} from "../../../../../shared/objects/api";
	import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";
	import {useUser} from "../../../stores/user";
	import {useDashboardEdits} from "../../../stores/dashboardEdits";
	import animatedDetails from "../../animatedDetails.vue";
	const user = useUser();

	const prevChanges = useDashboardEdits().ofData("contacts");
	const contactsState = ref(prevChanges || deepCloneFromReactive(user.data!.contacts));
	const newContactName = ref("");
	const newContactId = ref("");

	const emit = defineEmits(["newState"]);
	function emitNewContactsState() {
		emit("newState", [new UserPatchRequest("contacts", toRaw(contactsState.value))]);
	}

	function createNewContact() {
		contactsState.value.push({name: newContactName.value, id: newContactId.value});
		emitNewContactsState();
	}

	function deleteCurrentContact(index: number) {
		contactsState.value.splice(index as number, 1);
		emitNewContactsState();
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

	li:hover .deleteContactButton,
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

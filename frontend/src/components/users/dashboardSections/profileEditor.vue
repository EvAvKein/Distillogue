<template>
	<labelledInput :label="'Name'" :inputId="'editUserName'" :type="'text'" v-model="nameState" />
	<notification v-model:text="nameNotif.text" :desirablityStyle="nameNotif.desirability" />
</template>

<script setup lang="ts">
	import {ref, watch, toRaw} from "vue";
	import {debounce} from "../../../helpers/debounce";
	import {apiFetch} from "../../../helpers/apiFetch";
	import {useUser} from "../../../stores/user";
	import {UserPatchRequest} from "../../../../../shared/objects/api";
	import labelledInput from "../../labelledInput.vue";
	import notification from "../../notification.vue";
	const user = useUser();

	const nameState = ref(toRaw(user.data!.name));
	const nameNotif = ref({
		text: "",
		desirability: null as boolean | null,
	});

	watch(nameState, (newName) => {
		debounce(750, async () => {
			nameNotif.value.text = "";

			const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("name", newName)]);

			if (response.error) {
				nameNotif.value.text = response.error.message;
				nameNotif.value.desirability = false;
				return;
			}
			user.data!.name = newName;
		});
	});
</script>

<style scoped></style>

<template>
	<labelledInput :label="'Name'" :inputId="'editUserName'" :type="'text'" v-model="nameState" />
	<div>
		<h5>User ID</h5>
		<span id="userId">{{ user.data?.id }}</span>
	</div>
</template>

<script setup lang="ts">
	import {ref, watch, toRaw} from "vue";
	import {debounce} from "../../../helpers/debounce";
	import {apiFetch} from "../../../helpers/apiFetch";
	import {useUser} from "../../../stores/user";
	import {UserPatchRequest} from "../../../../../shared/objects/api";
	import labelledInput from "../../../components/labelledInput.vue";
	import {useNotifications} from "../../../stores/notifications";
	const user = useUser();
	const notifs = useNotifications();

	const nameState = ref(toRaw(user.data!.name));
	const nameNotif = ref({
		text: "",
		desirability: null as boolean | null,
	});

	watch(nameState, (newName) => {
		debounce(500, async () => {
			nameNotif.value.text = "";

			const response = await apiFetch("PATCH", "/users", [new UserPatchRequest("name", newName)]);

			if (response.error) {
				notifs.create(response.error.message, false);
				return;
			}
			user.data!.name = newName;
		});
	});
</script>

<style scoped>
	div {
		font-size: 0.9em;
		margin-top: 0.25em;
		text-align: center;
	}

	h5 {
		color: var(--textSubColor);
		font-weight: normal;
	}

	#userId {
		user-select: all;
	}
</style>

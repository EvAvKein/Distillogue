<template>
	<labelledInput :inputId="'editProfileName'" :type="'text'" :label="'Name'" v-model="nameState" />
</template>

<script setup lang="ts">
	import {ref, watch, toRaw} from "vue";
	import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";
	import {useUser} from "../../../stores/user";
	import {useDashboardEdits} from "../../../stores/dashboardEdits";
	import {UserPatchRequest} from "../../../../../shared/objects/api";
	import labelledInput from "../../labelledInput.vue";
	const user = useUser();
	const prevChanges = useDashboardEdits().ofData("name");

	const emit = defineEmits(["newState"]);

	const nameState = ref(prevChanges || deepCloneFromReactive(user.data!.name));

	watch(nameState, () => {
		emit("newState", [new UserPatchRequest("name", toRaw(nameState.value))]);
	});
</script>

<style scoped></style>

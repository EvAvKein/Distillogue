<template>
	<main>
		<postContainer v-if="post" :postObject="post" />
		<notification v-else v-model:text="notif.message" :desirablityStyle="notif.desirability" />
	</main>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import notification from "../components/notification.vue";
	import {Node} from "../../../shared/objects/post";
	import {apiFetch} from "../helpers/apiFetch";
	import postContainer from "../components/posts/view/postContainer_core.vue";

	const props = defineProps<{
		postId: string;
	}>();

	const post = ref<Node | undefined>(undefined);
	const notif = ref<{message: string; desirability: boolean | null}>({message: "Fetching post...", desirability: null});

	apiFetch("GET", "/posts/" + props.postId).then((response) => {
		if (response.error) {
			notif.value = {message: response.error.message, desirability: false};
			return;
		}
		post.value = response.data as Node;
	});
</script>

<style scoped></style>

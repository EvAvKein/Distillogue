<template>
	<main>
		<postContainer v-if="post" v-model:postObject="post" />
		<notification v-else v-model:text="notif.message" :desirablityStyle="notif.desirability" :customDuration="null" />
	</main>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import notification from "../../components/notification.vue";
	import {Post} from "../../../../shared/objects/post";
	import {apiFetch} from "../../helpers/apiFetch";
	import postContainer from "../../components/posts/view/postContainer.vue";

	const props = defineProps<{
		postId: string;
	}>();

	const post = ref<Post | undefined>(undefined);
	const notif = ref<{message: string; desirability: boolean | null}>({message: "Fetching post...", desirability: null});

	apiFetch("GET", "/posts/" + props.postId).then((response) => {
		if (response.error) {
			notif.value = {message: response.error.message, desirability: false};
			return;
		}
		post.value = response.data as Post;
	});
</script>

<style scoped></style>

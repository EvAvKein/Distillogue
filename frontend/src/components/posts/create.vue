<template>
  <form @submit.prevent>
    <section>
      <labelledInput
        :label="'Title'"
        :type="'text'"
        :required="true"
        :inputId="'postTitle'"
        v-model="postTitle"
      />
      <labelledInput
        :label="'Body'"
        :type="'textarea'"
        :required="true"
        :inputId="'postBody'"
        v-model="postBody"
      />
    </section>
    <section>
      <div>
        Public:
        <input type="checkbox"
          @change="(event) => {isPublic = (event.currentTarget as HTMLInputElement).checked ? true : false}"
        />
      </div>
    </section>
    <notification :text="notifText" :desirablityStyle="notifDesirability"/>
    <button @click="submit">Post</button>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import labelledInput from "../labelledInput.vue";
  import notification from "../notification.vue";
  import {Node, NodeConfig, NodeCreationRequest} from "../../../../backend/src/objects";
  import {jsonFetch} from "../../helpers/jsonFetch";
  import {useUser} from '../../stores/user';
  import {useRouter} from "vue-router";
  const user = useUser();
  const router = useRouter();

  // const props = defineProps<{
  // }>();

  const postTitle = ref<Node["title"]>("");
  const postBody = ref<Node["body"]>("");
  const isPublic = ref<NodeCreationRequest["public"]>(false);
  const config = ref<NodeConfig>({
  });
 
  const notifText = ref<string>("");
  const notifDesirability = ref<boolean>(true);
  
  async function submit() {
    notifText.value = "";

    const response = await jsonFetch("/createPost", new NodeCreationRequest(null, [user.data.id], isPublic.value, postTitle.value, postBody.value, config.value));

    if (response.error) {
      notifText.value = response.error.message;
      notifDesirability.value = false;
      return;
    };

    router.push("/browse");
  };
</script>

<style scoped>
  form {
    width: clamp(15em, 90%, 35em);
    margin: auto;
    padding: 0;
  }
</style>
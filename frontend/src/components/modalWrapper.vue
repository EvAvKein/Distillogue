<template>
  <Teleport :to="'body'">
    <div v-show="activeByTruthiness"
      id="backdrop" 
      @mousedown="emitDeactivateIfClicked"
    >
      <dialog open>
        <slot></slot>
      </dialog> 
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import {toRef, watch, onUnmounted} from "vue";

  const props = defineProps<{
    activeByTruthiness:any;
  }>();

  const emit = defineEmits(["deactivate"]); // emitting a deactivation request, as opposed to deactivating within this component, allows the parent component to set the variable used for activeByTruthiness to whichever falsey is appropriate for its type

  function emitDeactivateIfClicked(event:Event) {
    if (event.target === event.currentTarget) {
      emit("deactivate");
    };
  };

  function deactivateIfActive(event:KeyboardEvent) {
    if (props.activeByTruthiness && ["Esc", "Escape"].includes(event.key)) {
      emit("deactivate");
    };
  };

  document.addEventListener("keydown", deactivateIfActive);
  onUnmounted(() => {document.removeEventListener("keydown", deactivateIfActive)});

  const modalTruthiness = toRef(props, "activeByTruthiness");

  const header = document.querySelector("header")!;
  const main = document.querySelector("main")!;

  watch(modalTruthiness, (newTruthiness) => {
    main.style.overflow = newTruthiness ? "hidden" : "auto";

    [header, main].forEach((element) => {
      (element as HTMLElement & {inert:boolean|undefined|null}) // TODO: once typescript (and vue-typescript dependencies, if those are relevant) supports "inert", remove this intersection
        .inert = Boolean(props.activeByTruthiness) || null;
    });
  });
</script>

<style scoped>
  #backdrop {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #00000044;
    backdrop-filter: blur(1.75rem);
    display: flex;
    justify-content: center;
    overflow: auto;
  }

  dialog {
    font-size: clamp(1em, 4vw, 1.5em);
    position: relative;
    margin: auto;
    padding: 0;
    background-color: transparent;
    border: none;
  }
</style>
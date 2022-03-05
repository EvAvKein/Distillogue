<template>
  <Teleport :to="'body'">
    <div id="backdrop">
      <dialog>
        <slot></slot>
      </dialog> 
    </div>
  </Teleport>
</template>

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
  }
  dialog {
    display: block;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    padding: 0;
    background-color: transparent;
    border: none;
  };
</style>
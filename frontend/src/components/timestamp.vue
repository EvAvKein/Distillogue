<template>
  <span
    :title="stampText === absoluteTimestamp ? '' : absoluteTimestamp"
    :style="stampText === absoluteTimestamp ? {} : {'cursor': 'help'}"
  >
    {{stampText}}
  </span>
</template>

<script setup lang="ts">
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  function currentUnix() {return Math.floor(Date.now() / 1000)}

  const props = defineProps<{pastUnix:number}>();
  const dateObject = new Date(props.pastUnix * 1000);
  function doubleDigiter(number:string|number) {return number < 10 ? "0" + number : number};
  const absoluteTimestamp = `${doubleDigiter(dateObject.getHours())}:${doubleDigiter(dateObject.getMinutes())}, ${doubleDigiter(dateObject.getDate())}.${doubleDigiter((dateObject.getMonth()+1))}.${dateObject.getFullYear().toString().slice(-2)}`

  function timestamp(pastUnix:number) {
    const unixDiff = (currentUnix() - pastUnix);
    if (unixDiff > week) {return absoluteTimestamp};
    if (unixDiff > day) {return Math.floor(unixDiff / day) + "d ago"};
    if (unixDiff > hour) {return Math.floor(unixDiff / hour) + "h ago"};
    if (unixDiff > minute) {return Math.floor(unixDiff / minute) + "m ago"};
    if (unixDiff > 15) {return unixDiff + "s ago"};
    return "Now";
  };

  const stampText = props.pastUnix !== undefined ? timestamp(props.pastUnix) : "error: add pastUnix timestamp prop";
</script>
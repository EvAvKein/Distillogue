<template>
	<span
		:title="timestamp === absoluteTimestamp ? '' : absoluteTimestamp"
		:style="timestamp === absoluteTimestamp ? {} : {cursor: 'help'}"
	>
		{{ timestamp }}
	</span>
</template>

<script setup lang="ts">
	const props = defineProps<{pastUnix: number}>();

	const minute = 60;
	const hour = minute * 60;
	const day = hour * 24;
	const week = day * 7;

	function dblDigit(number: number) {
		return number < 10 ? "0" + number : number;
	}

	const date = new Date(props.pastUnix * 1000);
	const absoluteTimestamp =
		`${dblDigit(date.getHours())}:${dblDigit(date.getMinutes())}, ` +
		`${dblDigit(date.getDate())}.${dblDigit(date.getMonth() + 1)}.${date.getFullYear().toString().slice(-2)}`;

	function calcTimestamp() {
		const currentUnix = Math.floor(Date.now() / 1000);
		const unixDiff = currentUnix - props.pastUnix;
		if (unixDiff > week) return absoluteTimestamp;
		if (unixDiff > day) return Math.floor(unixDiff / day) + "d ago";
		if (unixDiff > hour) return Math.floor(unixDiff / hour) + "h ago";
		if (unixDiff > minute) return Math.floor(unixDiff / minute) + "m ago";
		if (unixDiff > 15) return unixDiff + "s ago";
		return "Now";
	}

	const timestamp = calcTimestamp();
</script>

<style scoped>
	span {
		white-space: nowrap;
	}
</style>

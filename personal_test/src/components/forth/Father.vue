<script setup lang="ts">
import { ref, reactive } from 'vue';
import Child from './Child.vue';
let isVisible = ref(false)
const toggleVisibility = () => isVisible.value = !isVisible.value;
</script>

<template>
    <Child :isVisible="isVisible" @toggleVisibility="toggleVisibility" />
</template>

<style scoped></style>
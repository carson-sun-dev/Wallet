<script setup lang="ts">
import { ref, reactive } from 'vue';
const props = defineProps<{ isVisible: boolean }>()
const emit = defineEmits<{
    'toggleVisibility': [];//无参数传参
}>()
const toggle = () => emit('toggleVisibility')
</script>

<template>
    <div>
        <button @click="toggle">Toggle Visibility</button>
        <p v-if="isVisible">Hello, World!</p>
        <p v-else>Goodbye, World!</p>
    </div>
</template>

<style scoped></style>
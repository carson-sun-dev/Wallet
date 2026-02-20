<script setup lang="ts">
import { ref, reactive } from 'vue';
import Child from '@/components/second/Child.vue';

const updateInputValue = (value: string) => {
    console.log(value);
}
</script>

<template>
    <Child @search="updateInputValue" />


</template>

<style scoped></style>
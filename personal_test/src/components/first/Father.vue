<script setup lang="ts">
import { ref, reactive } from 'vue';
import Child1 from '@/components/first/Child1.vue';
let likeCount = ref<number>(0)
const IncrementLikeCount = () => {
    likeCount.value++
}
</script>

<template>
    <Child1 :likeCount="likeCount" @incrementLikeCount="IncrementLikeCount" />
</template>

<style scoped></style>
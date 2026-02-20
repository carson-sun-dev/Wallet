<script setup lang="ts">
import { ref, reactive } from 'vue';
const props = defineProps<{ likeCount: number }>()
// 格式： (e: 事件名, 参数: 类型): 返回值
const emit = defineEmits<{ (e: 'incrementLikeCount'): void }>()
const addLike = () => { emit('incrementLikeCount') }
</script>

<template>
    <p>The current like count is: {{ likeCount }}</p>
    <button @click="addLike">Add Like</button>
</template>

<style scoped></style>
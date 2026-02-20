<!--让组件只负责渲染 “一个” 用户，并正确设置默认值。-->
<script setup lang="ts">
import { ref, reactive } from 'vue';
interface User {
    name: string;
    age?: number;
    isVip?: boolean;
}
const props = withDefaults(
    defineProps<{ user: User }>(),
    //默认值必须是一个函数，因为Vue会在组件每次渲染时重新计算默认值，而不是在组件初始化时计算一次。
    {
        user: () => ({
            name: '未知用户',
            age: 18,
            isVip: false
        })
    }
)
</script>

<template>
    <div class="user-card">
        <span :style="{ color: user.isVip ? 'red' : 'black' }">
            姓名: {{ user.name }}
        </span>
        <span> | 年龄: {{ user.age ?? '保密' }}</span>
        <span v-if="user.isVip"> [VIP会员] </span>
    </div>
</template>

<style scoped>
.user-card {
    border-bottom: 1px solid black;
    padding: 10px;
}
</style>
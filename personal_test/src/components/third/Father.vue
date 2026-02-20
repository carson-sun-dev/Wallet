<script setup lang="ts">
import { ref } from 'vue';
import Child from './Child.vue';


// 2. 更推荐的做法：定义一个数组
const userList = ref([
    { name: 'John', age: 20, isVip: true },
    { name: 'Jane' }, // 只有名字
    { name: 'Jim', age: 30 } // 修正了 "30" 为 30
])
</script>

<template>
    <div>
        <h1>用户列表</h1>
        <!-- //这个 item 的生命周期只存在于这一行标签内部。 一行都拿得到item，至于key也不合理，一般数据库会返回id，两个一样的key会黄色警告-->
        <Child v-for="item in userList" :key="item.name" :user="item" />
    </div>
</template>
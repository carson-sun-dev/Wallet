<!-- v-model是语法糖，本质是 :value和@input的组合，所以可以直接监听input事件，也可以直接绑定value属性 -->
<script setup lang="ts">
import { ref } from 'vue'

// 1. 挖坑：定义一个响应式变量
const searchContent = ref('')
//Vue 3.3+ 的简写泛型语法
//search: [text: string, isRealtime: boolean]; // 多参数传参
//close: []; // 无参数传参
//比传统语法{ (e: 'search', val: string): void } 更简洁
const emit = defineEmits<{
    'search': [content: string];//这里content是自定的用来描述参数的名称，不要写具体变量名字，string是参数类型
}>()

const handleSearch = () => {
    // 3. 直接发货：此时 searchContent.value 就是输入框里的文字
    emit('search', searchContent.value)//由于定义事件设置string，会严格检查
    // 额外福利：搜完自动清空输入框
    searchContent.value = ''
}
</script>

<template>
    <input v-model="searchContent" type="text" />
    <!-- 
它怎么“知道”更新的是输入？（智能识别机制）
Vue 的 v-model 并不是死板的，它会根据你放在什么标签上，自动切换底层策略：

如果是 <input type="text"> 或 <textarea>：它监听 input 事件，并绑定 value 属性。

如果是 <input type="checkbox"> 或 <input type="radio">：它会自动改写逻辑，监听 change 事件，并绑定 checked 属性。

如果是 <select>：它会监听 change 事件，并寻找选中的 <option> 的值。    
    -->
    <br />
    <button @click="handleSearch">搜索</button>
</template>
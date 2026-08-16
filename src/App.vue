<script setup>
import { ref } from 'vue';
import { useThrottle, useDebouncedValue } from '../plugin/index.js';

/* 1. 防抖搜索：v-model 是实时值，useDebouncedValue 是停止输入后的防抖值 */
const keyword = ref('');
const debouncedKeyword = useDebouncedValue(keyword, 400);

/* 2. 节流连点：@click 记录真实点击，v-throttle 指令记录“节流后真正执行”的次数 */
const clickCount = ref(0);
const execCount = ref(0);
const onThrottledClick = () => { execCount.value++; };

/* 3. 加载按钮：用 useThrottle 防止连点重复提交，配合 loading 态 */
const loading = ref(false);
const submitted = ref(0);
const doSubmit = useThrottle(() => {
  if (loading.value) return;
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    submitted.value++;
  }, 1500);
}, 1200);
</script>

<template>
  <div class="page">
    <h1>防抖 &amp; 节流 · Vue3 插件演示</h1>
    <p class="sub">debounce-throttle-loader · Vite + Vue3</p>

    <section class="card">
      <h2>1. 防抖 —— 搜索输入 <span class="tag">composable</span></h2>
      <input
        v-model="keyword"
        placeholder="输入关键词，停止 400ms 后才触发搜索"
      />
      <div class="row">
        <span>实时输入：<strong>{{ keyword || '—' }}</strong></span>
        <span>防抖结果：<strong>{{ debouncedKeyword || '—' }}</strong></span>
      </div>
    </section>

    <section class="card">
      <h2>2. 节流 —— 连点按钮 <span class="tag">v-throttle 指令</span></h2>
      <button @click="clickCount++" v-throttle:click.500="onThrottledClick">
        疯狂点我
      </button>
      <div class="row">
        <span>真实点击：<strong>{{ clickCount }}</strong> 次</span>
        <span>节流执行：<strong>{{ execCount }}</strong> 次（每 500ms 最多 1 次）</span>
      </div>
    </section>

    <section class="card">
      <h2>3. 加载按钮 —— 防重复提交 <span class="tag">useThrottle</span></h2>
      <button class="submit" :disabled="loading" @click="doSubmit">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? '提交中…' : '提交' }}
      </button>
      <p>成功提交次数：<strong>{{ submitted }}</strong></p>
    </section>

    <footer>插件还提供：全局 $debounce / $throttle、v-debounce 指令、useDebounce / useDebouncedRef</footer>
  </div>
</template>

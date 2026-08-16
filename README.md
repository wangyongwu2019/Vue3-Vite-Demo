# debounce-throttle-loader · Vue3 防抖 / 节流插件

一个零依赖的 Vue3 插件，提供 `debounce`（防抖）与 `throttle`（节流）能力，附基于 **Vite + Vue3** 的演示应用。

## 目录结构

```
debounce-throttle-vue/
├── plugin/                 # 插件本体（可独立抽取发布）
│   ├── debounce.js         # 防抖核心实现
│   ├── throttle.js         # 节流核心实现
│   ├── directives.js       # v-debounce / v-throttle 指令
│   ├── composables.js      # useDebounce / useThrottle / ...
│   └── index.js            # Vue 插件入口（install）
├── src/                    # Vite + Vue3 演示应用
│   ├── main.js
│   ├── App.vue
│   └── style.css
├── tests/plugin.test.js    # 核心逻辑单测
├── index.html
├── vite.config.js
└── package.json
```

## 快速开始

```bash
npm install
npm run dev        # 开发：http://localhost:5173（已配置 host: true，手机可局域网访问）
npm run build      # 生产构建
npm run test       # 运行核心逻辑单测
```

## 安装插件

```js
import { createApp } from 'vue';
import DebounceThrottle from './plugin/index.js';

createApp(App)
  .use(DebounceThrottle, { debounceWait: 300, throttleWait: 200 })
  .mount('#app');
```

`install` 的选项：`debounceWait`（v-debounce 默认时长）、`throttleWait`（v-throttle 默认时长），均可省略。

## 四种用法

### 1. 全局方法（Options API）

```vue
<template>
  <input @input="$debounce(onInput, 300)" />
  <button @click="$throttle(onClick, 500)">点我</button>
</template>

<script>
export default {
  methods: {
    onInput(e) { /* ... */ },
    onClick() { /* ... */ }
  }
};
</script>
```

### 2. 指令

```vue
<!-- 事件名通过参数指定，数字修饰符为等待时长（毫秒） -->
<input v-debounce:input.300="onSearch" />
<button v-throttle:click.500="onClick">连点</button>
<div v-throttle:scroll.200="onScroll">...</div>
```

### 3. 组合式 API

```vue
<script setup>
import { ref } from 'vue';
import { useDebounce, useThrottle, useDebouncedRef, useDebouncedValue } from './plugin/index.js';

const onSearch = useDebounce((kw) => { /* 停止输入后执行 */ }, 400);
const onClick = useThrottle(() => { /* 每 500ms 最多执行一次 */ }, 500);

const [name, setName] = useDebouncedRef('', 300);   // 防抖的 ref 写入
const kw = ref('');
const debouncedKw = useDebouncedValue(kw, 400);      // 监听源，返回防抖后的值
</script>
```

### 4. 直接导入

```js
import { debounce, throttle } from './plugin/index.js';

const d = debounce(fn, 300, { leading: false, trailing: true });
d.cancel();  // 取消
d.flush();   // 立即执行未执行的调用

const t = throttle(fn, 500, { leading: true, trailing: true });
t.cancel();
```

## API

### debounce(fn, wait = 300, options)

| 参数 | 说明 |
| --- | --- |
| `fn` | 要防抖的函数 |
| `wait` | 等待时长（毫秒） |
| `options.leading` | 首次触发立即执行，默认 `false` |
| `options.trailing` | 停止后执行最后一次，默认 `true` |

返回值带 `.cancel()` / `.flush()` 方法。

### throttle(fn, wait = 300, options)

| 参数 | 说明 |
| --- | --- |
| `options.leading` | 首次触发立即执行，默认 `true` |
| `options.trailing` | 窗口内最后一次触发在窗口结束后补执行，默认 `true` |

返回值带 `.cancel()` 方法。

## 演示页面（3 个场景）

1. **搜索输入防抖** —— `useDebouncedValue`，停止输入 400ms 后才触发；
2. **连点按钮节流** —— `v-throttle:click.500` 指令，对比「真实点击次数」与「节流后执行次数」；
3. **加载按钮防重复提交** —— `useThrottle` + `loading` 态（带 spinner）。

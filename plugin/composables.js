/**
 * Vue3 组合式 API（composables）
 */
import { ref, watch, onUnmounted } from 'vue';
import { debounce } from './debounce.js';
import { throttle } from './throttle.js';

/** 返回一个“防抖函数”，组件卸载时自动 cancel */
export function useDebounce(fn, wait = 300, options = {}) {
  const d = debounce(fn, wait, options);
  onUnmounted(() => d.cancel());
  return d;
}

/** 返回一个“节流函数”，组件卸载时自动 cancel */
export function useThrottle(fn, wait = 300, options = {}) {
  const t = throttle(fn, wait, options);
  onUnmounted(() => t.cancel());
  return t;
}

/** 防抖的 ref 写入：返回 [ref, setter]，setter 多次调用只在停止后更新一次 ref */
export function useDebouncedRef(value, wait = 300) {
  const state = ref(value);
  const setter = debounce((v) => { state.value = v; }, wait);
  onUnmounted(() => setter.cancel());
  return [state, setter];
}

/** 监听一个响应式源，返回其“防抖后的值” */
export function useDebouncedValue(source, wait = 300) {
  const debounced = ref(source.value);
  let timer = null;
  const stop = watch(source, (v) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { debounced.value = v; }, wait);
  });
  onUnmounted(() => {
    if (timer) clearTimeout(timer);
    stop();
  });
  return debounced;
}

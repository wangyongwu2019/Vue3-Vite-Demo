/**
 * Vue3 指令：v-debounce / v-throttle
 *
 * 用法：
 *   <input v-debounce:input.300="onSearch" />    // input 事件，300ms 防抖
 *   <button v-throttle:click.500="onClick" />    // click 事件，500ms 节流
 *
 * 说明：
 *   - 参数（arg）：事件名，默认 click
 *   - 数字修饰符：等待时长（毫秒），缺省用默认值
 *   - 绑定值（value）：事件处理函数
 */
import { debounce } from './debounce.js';
import { throttle } from './throttle.js';

function waitFromModifiers(modifiers, fallback) {
  for (const key of Object.keys(modifiers || {})) {
    const n = parseInt(key, 10);
    if (!isNaN(n) && n > 0) return n;
  }
  return fallback;
}

function createDirective(kind, defaultWait) {
  const factory = kind === 'debounce' ? debounce : throttle;

  return {
    mounted(el, binding) {
      const event = binding.arg || 'click';
      const wait = waitFromModifiers(binding.modifiers, defaultWait);
      const handler = factory((ev) => binding.value(ev), wait);
      handler.__fn = binding.value;
      el.__vtHandlers = el.__vtHandlers || {};
      el.__vtHandlers[event] = handler;
      el.addEventListener(event, handler);
    },
    updated(el, binding) {
      // 处理函数引用变化时重新绑定（如 v-for 场景）
      const event = binding.arg || 'click';
      const prev = el.__vtHandlers && el.__vtHandlers[event];
      if (prev && prev.__fn !== binding.value) {
        prev.cancel();
        el.removeEventListener(event, prev);
        const wait = waitFromModifiers(binding.modifiers, defaultWait);
        const handler = factory((ev) => binding.value(ev), wait);
        handler.__fn = binding.value;
        el.__vtHandlers[event] = handler;
        el.addEventListener(event, handler);
      }
    },
    unmounted(el, binding) {
      const event = binding.arg || 'click';
      const handler = el.__vtHandlers && el.__vtHandlers[event];
      if (handler) {
        handler.cancel();
        el.removeEventListener(event, handler);
      }
    }
  };
}

export function createDebounceDirective(defaultWait = 300) {
  return createDirective('debounce', defaultWait);
}

export function createThrottleDirective(defaultWait = 200) {
  return createDirective('throttle', defaultWait);
}

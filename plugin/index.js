/**
 * debounce-throttle-loader —— 防抖 / 节流 Vue3 插件
 *
 * 安装后提供四种用法：
 *   1. 全局方法：this.$debounce(fn, wait) / this.$throttle(fn, wait)
 *   2. 指令：v-debounce:event.300="handler" / v-throttle:event.300="handler"
 *   3. 组合式 API：useDebounce / useThrottle / useDebouncedRef / useDebouncedValue
 *   4. 直接导入：import { debounce, throttle } from '...'
 *
 * 示例：
 *   app.use(DebounceThrottle, { debounceWait: 300, throttleWait: 200 })
 */
import { debounce } from './debounce.js';
import { throttle } from './throttle.js';
import { createDebounceDirective, createThrottleDirective } from './directives.js';

export { debounce, throttle };
export {
  useDebounce,
  useThrottle,
  useDebouncedRef,
  useDebouncedValue
} from './composables.js';

const plugin = {
  install(app, options = {}) {
    const debounceWait = options.debounceWait ?? 300;
    const throttleWait = options.throttleWait ?? 200;

    // 全局方法
    app.config.globalProperties.$debounce = debounce;
    app.config.globalProperties.$throttle = throttle;

    // 指令
    app.directive('debounce', createDebounceDirective(debounceWait));
    app.directive('throttle', createThrottleDirective(throttleWait));
  }
};

export default plugin;

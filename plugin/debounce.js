/**
 * debounce —— 防抖：在连续触发停止 wait 毫秒后才执行一次。
 * 支持：
 *   - leading: 第一次触发立即执行
 *   - trailing: 停止后执行最后一次（默认开启）
 *   - .cancel(): 取消尚未执行的调用
 *   - .flush(): 立即执行尚未执行的调用（若存在）
 *
 * @param {Function} fn      要防抖的函数
 * @param {number}   wait    等待时长（毫秒）
 * @param {object}   options { leading = false, trailing = true }
 * @returns {Function} 带 cancel / flush 方法的防抖函数
 */
export function debounce(fn, wait = 300, options = {}) {
  const { leading = false, trailing = true } = options;

  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let result;

  function invoke() {
    const ctx = lastThis;
    const args = lastArgs;
    lastThis = null;
    lastArgs = null;
    result = fn.apply(ctx, args);
    return result;
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastThis = null;
    lastArgs = null;
  }

  function flush() {
    if (!timer) return result;
    clearTimeout(timer);
    timer = null;
    if (lastArgs !== null) {
      result = fn.apply(lastThis, lastArgs);
      lastThis = null;
      lastArgs = null;
    }
    return result;
  }

  function debounced(...args) {
    lastThis = this;
    lastArgs = args;

    // leading 且当前没有等待中的调用 → 立即执行
    const callNow = leading && !timer;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs) invoke();
    }, wait);

    if (callNow) invoke();
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

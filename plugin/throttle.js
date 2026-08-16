/**
 * throttle —— 节流：在 wait 时间窗口内最多执行一次。
 * 支持：
 *   - leading: 第一次触发立即执行（默认开启）
 *   - trailing: 时间窗口内的最后一次触发会在窗口结束后补执行（默认开启）
 *   - .cancel(): 取消未执行的补执行定时器
 *
 * @param {Function} fn      要节流的函数
 * @param {number}   wait    时间窗口（毫秒）
 * @param {object}   options { leading = true, trailing = true }
 * @returns {Function} 带 cancel 方法的节流函数
 */
export function throttle(fn, wait = 300, options = {}) {
  const { leading = true, trailing = true } = options;

  let timer = null;
  let lastInvokeTime = 0;
  let lastArgs = null;
  let lastThis = null;
  let result;

  function invoke(time) {
    lastInvokeTime = time;
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
    lastInvokeTime = 0;
    lastThis = null;
    lastArgs = null;
  }

  function throttled(...args) {
    const time = Date.now();
    lastThis = this;
    lastArgs = args;

    const isFirst = lastInvokeTime === 0;
    // 首次触发但不需要立即执行：只安排一次尾随执行
    if (isFirst && !leading) {
      if (!timer && trailing) {
        timer = setTimeout(() => {
          timer = null;
          invoke(Date.now());
        }, wait);
      }
      return result;
    }

    const remaining = wait - (time - lastInvokeTime);
    if (remaining <= 0) {
      // 到点（或首次）→ 立即执行
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      invoke(time);
    } else if (!timer && trailing) {
      // 时间窗口内多次触发 → 安排最后一次在窗口结束后执行
      timer = setTimeout(() => {
        timer = null;
        invoke(Date.now());
      }, remaining);
    }
    return result;
  }

  throttled.cancel = cancel;
  return throttled;
}

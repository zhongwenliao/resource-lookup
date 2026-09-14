/**
 * Web Worker：渲染进程内的独立线程
 *
 * 技术点：Worker 拥有独立的事件循环、调用栈与内存堆，与主线程并行执行；
 * 但全局对象是 self 而非 window —— 拿不到 document / DOM API，只能做纯计算与消息通信。
 */
self.onmessage = (e) => {
  const { count } = e.data; // postMessage 传参：结构化克隆（深拷贝），线程间不共享内存
  const start = performance.now();
  let sum = 0;
  for (let i = 0; i < count; i++) sum += i;
  // 结果同样走结构化克隆回传主线程
  self.postMessage({ sum, cost: performance.now() - start });
};

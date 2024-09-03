// 事件基类
export default class Index {
  constructor() {
    this.events = {};
  }

  // 绑定事件
  on(eventName, fn) {
    // 判断事件是否存在，没有则创建数组
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(fn);
  }

  // 关闭事件
  off(eventName, fn) {
    // 判断事件是否存在，没有则跳过处理
    if (!this.events[eventName]) {
      return;
    }

    // 过滤掉不需要的数据
    this.events[eventName] = this.events[eventName].filter((item) => item !== fn);
  }

  // 触发事件
  emit(eventName, params) {
    // 判断事件是否存在，没有则跳过处理
    if (!this.events[eventName]) {
      return;
    }
    this.events[eventName].forEach((fn) => {
      fn.call(this, params);
    });
  }
}

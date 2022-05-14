export class Dep {
  static target = null

  constructor() {
    this.subs = [];
  }

  // 添加订阅者
  addSub(sub) {
    if (this.subs.indexOf(sub) === -1) {
      this.subs.push(sub)
    }
  }

  // 提示订阅者
  notify() {
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

const targetStack = [];

export function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target;
}

export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}

import { popTarget, pushTarget } from "./dep.js";

export class Subscriber {
  constructor(vm, expOrFn, cb, lazy) {
    this.vm = vm;
    this.cb = cb;
    this.expOrFn = expOrFn;
    this.lazy = !!lazy;
    this.dirty = this.lazy;

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else if (expOrFn) {
      this.getter = new Function(`with(this){return ${expOrFn};}`);
    } else {
      this.getter = function getter() { }
    }

    this.value = this.lazy ? undefined : this.get();
  }

  update() {
    if (this.lazy) {
      this.dirty = true;
    } else {
      const oldValue = this.value;
      this.value = this.get();
      if (typeof this.cb === 'function') {
        this.cb(oldValue, this.value);
      }
    }
  }

  get() {
    pushTarget(this)
    let value;
    try {
      value = this.getter.call(this.vm, this.vm);
    } finally {
      popTarget();
    }
    return value;
  }

  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }
}


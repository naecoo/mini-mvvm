import { Dep } from "./dep.js";

function defineReactive(obj, key, val) {
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    get: function reactiveSetter() {
      if (Dep.target) {
        dep.addSub(Dep.target);
      }
      observe(val);
      return val;
    },
    set: function reactiveGetter(newVal) {
      if (newVal === val) return;
      val = newVal;
      observe(newVal);
      dep.notify();
    }
  })
}

export function observe(obj) {
  if (!obj || typeof obj !== 'object' || obj.__ob__) return;

  Object.defineProperty(obj, '__ob__', {
    enumerable: false,
    value: true
  })

  for (const key in obj) {
    defineReactive(obj, key, obj[key]);
  }
}

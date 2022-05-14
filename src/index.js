import { observe } from './observer.js'
import { Dep, popTarget, pushTarget } from './dep.js'
import { Subscriber } from './subscriber.js'

// 一个简单的 MVVM 框架
export class Vue {
  constructor(options) {
    this.options = options;

    this.initMethods(options.methods);

    this.initData(options.data);

    this.initComputed(options.computed);

    this.initWatch(options.watch);

    this.sub = new Subscriber(
      this,
      () => {
        this.walk(document.querySelector(this.options.el))
      },
      null,
      false
    );
  }

  initData(data) {
    if (!data) return;

    observe(data)
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(val) {
          data[key] = val;
        }
      })
    });
  }

  initComputed(computed) {
    if (!computed) return;

    const subs = this._computedSubs = {};
    for (const key in computed) {
      const getter = computed[key];
      subs[key] = new Subscriber(
        this,
        getter,
        null,
        true
      );
      Object.defineProperty(this, key, {
        get() {
          const sub = this._computedSubs[key];
          if (sub.dirty) {
            sub.evaluate();
          }
          return sub.value;
        }
      });
    }
  }

  initWatch(watch) {
    if (!watch) return;

    // 不支持computed，读取computed的时候，读取的是computed的getter，找不到data的getter里面
    const subs = this._watchSubs = {};
    for (const key in watch) {
      subs[key] = new Subscriber(
        this,
        key,
        watch[key].handler.bind(this),
        false
      );
    }
  }

  initMethods(methods) {
    if (!methods) return;

    Object.keys(methods).forEach(key => {
      this[key] = methods[key].bind(this);
    });
  }

  walk(elm) {
    if (!elm) return;

    const attrs = elm.attributes;
    for (const attr of attrs) {
      const { name, value } = attr;
      // prop
      if (name.startsWith('v-bind:')) {
        const prop = name.slice(7);
        elm.setAttribute(prop, this[value]);
      }

      // text
      if (name.startsWith('v-text')) {
        elm.innerText = new Function(`with(this){return ${value};}`).call(this);
      }

      // event
      if (name.startsWith('v-on:')) {
        const event = name.slice(5);
        elm.removeEventListener(event, this[value]);
        elm.addEventListener(event, this[value]);
      }
    }

    // children
    const children = elm.children;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        this.walk(children[i]);
      }
    }
  }
}

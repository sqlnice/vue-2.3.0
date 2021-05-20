/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'
// VUE改写数组的方法，七个
const arrayProto = Array.prototype
// 创建一个新的数组对象，修改该对象上的数组的七个方法，防止污染原生数组方法
export const arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */
;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  // 缓存原生的方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator () {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    let i = arguments.length
    const args = new Array(i)
    while (i--) {
      args[i] = arguments[i]
    }
    // 调用原生的数组方法
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    // push、unshift、splice参数大于2时，要重新调用ob.observeArray，因为这三种情况都是像数组中添加新的元素，所以需要重新观察每个子元素。
    switch (method) {
      case 'push':
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    // dep通知所有注册的观察者进行响应式处理
    ob.dep.notify()
    return result
  })
})

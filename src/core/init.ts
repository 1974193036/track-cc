import { setupOptions } from './options'
import { setupReplace } from './setup'
import EventCollection from './event'
import { EventType, type IOptions, type ViewModel } from '../types'
import { setupDirective } from './directive'

export const init = (options: IOptions) => {
  setupOptions(options)
  setupReplace()
}

export const install = (Vue: any, options: IOptions) => {
  init(options)
  setupDirective(Vue)
  const handler = Vue.config.errorHandler
  Vue.config.errorHandler = function (err: Error, vm: ViewModel, info: string): void {
    EventCollection[EventType.Error](err)
    if (handler) handler.apply(null, [err, vm, info])
  }
}

/**
 * 收集react ErrorBoundary中的错误对象
 * 需要用户手动在componentDidCatch中设置
 * @param err ErrorBoundary中的componentDidCatch的一个参数error
 */
export const errorBoundaryReport = (err: Error): void => {
  EventCollection[EventType.Error](err)
}

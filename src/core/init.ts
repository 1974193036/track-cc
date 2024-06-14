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

import options from '../../options'
import { EventType, type HttpData } from '../../../types'
import EventCollection from '../../event'
import { addListenOrReplace } from './replace'

export const setupReplace = () => {
  const switchMap = options.getSwitchMap()
  console.log('switchMap', switchMap)
  const globalClickListeners = options.getGlobalClickListeners()
  console.log('globalClickListeners', globalClickListeners)
  globalClickListeners.length &&
    addListenOrReplace({
      type: EventType.Click,
      callback: EventCollection[EventType.Click],
    })
  switchMap[EventType.Error] &&
    addListenOrReplace({
      type: EventType.Error,
      callback: EventCollection[EventType.Error],
    })
  switchMap[EventType.HashChange] &&
    addListenOrReplace({
      type: EventType.HashChange,
      callback: EventCollection[EventType.HashChange],
    })
  switchMap[EventType.History] &&
    addListenOrReplace({
      type: EventType.History,
      callback: EventCollection[EventType.History],
    })
  switchMap[EventType.XHR] &&
    addListenOrReplace({
      type: EventType.XHR,
      callback: (data: HttpData) => {
        EventCollection[EventType.Http](data, EventType.XHR)
      },
    })
  switchMap[EventType.Fetch] &&
    addListenOrReplace({
      type: EventType.Fetch,
      callback: (data: HttpData) => {
        EventCollection[EventType.Http](data, EventType.Fetch)
      },
    })
  switchMap[EventType.UnhandledRejection] &&
    addListenOrReplace({
      type: EventType.UnhandledRejection,
      callback: EventCollection[EventType.UnhandledRejection],
    })
}

import throttle from 'lodash/throttle'
import { Callback, IReplaceParams, EventType } from '../../../types'
import { on, EventEmitter, _global } from '../../../utils'

const eventEmitter = new EventEmitter()

const emit = (type: EventType, data?: any) => {
  eventEmitter.emit(type, data)
}

const subscribe = (type: EventType, callback: Callback) => {
  eventEmitter.subscribe(type, callback)
}

export const addListenOrReplace = (replaceParams: IReplaceParams) => {
  const { type, callback } = replaceParams
  subscribe(type, callback)
  listenOrReplace(type)
}

const listenOrReplace = (type: EventType) => {
  switch (type) {
    case EventType.Click:
      listenWindowClick()
      break
    case EventType.Error:
      listenError()
      break
    case EventType.HashChange:
      listenHashChange()
      break
  }
}

const listenWindowClick = () => {
  on({
    el: _global,
    eventName: 'click',
    event: throttle(function (e: PointerEvent) {
      emit(EventType.Click, e)
    }, 300),
    capture: true,
  })
}

const listenError = () => {
  on({
    el: _global,
    eventName: 'error',
    event: (e: ErrorEvent) => {
      emit(EventType.Error, e)
    },
    capture: true,
  })
}

const listenHashChange = () => {
  on({
    el: _global,
    eventName: 'hashchange',
    event: (e: HashChangeEvent) => {
      emit(EventType.HashChange, e)
    },
  })
}

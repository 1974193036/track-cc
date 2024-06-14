import throttle from 'lodash/throttle'
import { Callback, IReplaceParams, EventType, voidFunc } from '../../../types'
import { on, EventEmitter, _global, getCurrentHref } from '../../../utils'

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
    case EventType.History:
      replaceHistory()
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

let preHref: string = getCurrentHref()
const replaceHistory = () => {
  const onPopstate = _global.onpopstate
  _global.onpopstate = function (this: any, ...args: any) {
    const to = getCurrentHref()
    const from = preHref
    preHref = to
    emit(EventType.History, {
      from,
      to,
    })
    onPopstate?.apply(this, args)
  }
  const replaceFn = (originalFn: voidFunc): voidFunc => {
    return function (this: any, ...args: any[]) {
      const url = args?.[2]
      if (url) {
        const from = preHref
        const to = url
        preHref = to
        emit(EventType.History, {
          from,
          to,
        })
      }
      return originalFn.apply(this, args)
    }
  }
  replaceAop(_global.history, 'pushState', replaceFn)
  replaceAop(_global.history, 'replaceState', replaceFn)
}

export function replaceAop(
  source: { [key: string]: any },
  name: string,
  replacement: voidFunc,
  isForced = false,
) {
  if (source === undefined) return
  if (name in source || isForced) {
    const original = source[name]
    const wrapped = replacement(original)
    if (typeof wrapped === 'function') {
      source[name] = wrapped
    }
  }
}

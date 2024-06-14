import throttle from 'lodash/throttle'
import isFunction from 'lodash/isFunction'
import { Callback, IReplaceParams, EventType, voidFunc, RequestMethod } from '../../../types'
import { on, EventEmitter, _global, getCurrentHref, getTimestamp } from '../../../utils'
import options from '../../options'

// 判断请求的 url 需不需要过滤
const checkIsDisabledUrl = (url: string, method: string) => {
  const { filterHttpUrl, report } = options.get()
  const { url: reportUrl } = report
  const isReportUrl = reportUrl === url && method === RequestMethod.POST
  const isFilterHttpUrl = isFunction(filterHttpUrl) && filterHttpUrl(url, method)
  return isReportUrl || isFilterHttpUrl
}

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
    case EventType.XHR:
      replaceXhr()
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

const replaceXhr = () => {
  const xhrProto = XMLHttpRequest.prototype
  replaceAop(xhrProto, 'open', (originalOpen: voidFunc) => {
    return function (this: any, ...args: any[]): void {
      const [method, url] = args
      this.trackParams = {
        method: (method as string).toLowerCase(),
        url,
        time: getTimestamp(),
        type: EventType.XHR,
      }
      originalOpen.apply(this, args)
    }
  })
  replaceAop(xhrProto, 'send', (originalSend: voidFunc) => {
    return function (this: any, ...args: any[]): void {
      const [requestData] = args
      const { method, url } = this.trackParams
      on({
        el: this,
        eventName: 'loadend',
        event(this: any) {
          if (checkIsDisabledUrl(url, method)) return

          const { responseType, response, status } = this
          this.trackParams.requestData = requestData
          this.trackParams.Status = status
          this.trackParams.elapsedTime = getTimestamp() - this.trackParams.time
          if (['', 'json', 'text'].includes(responseType)) {
            const { checkHttpStatus } = options.get()
            // 用户设置handleHttpStatus函数来判断接口是否正确，只有接口报错时才保留response
            if (isFunction(checkHttpStatus)) {
              if (checkHttpStatus(response)) {
                this.trackParams.response = response && JSON.parse(response)
              } else {
                this.trackParams.response = null
              }
            } else {
              this.trackParams.response = response && JSON.parse(response)
            }
          }
          emit(EventType.XHR, this.trackParams)
        },
      })
      originalSend.apply(this, args)
    }
  })
}

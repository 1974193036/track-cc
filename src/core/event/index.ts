import ErrorStackParser from 'error-stack-parser'
import takeRight from 'lodash/takeRight'
import {
  EventType,
  StatusType,
  type IErrorTarget,
  type IRouteParams,
  type HttpData,
} from '../../types'
import options from '../options'
import {
  getTargetDomByPointerEvent,
  getTimestamp,
  htmlElementAsString,
  parseUrlToObj,
  unknownToString,
} from '../../utils'
import eventTrack from './event'
import report from '../report'
import { httpTransform } from '../transform'

const hashCallback = () => {
  let urls: any[] = []
  return (data: HashChangeEvent) => {
    // console.log('hashCallback', data)
    const { historyUrlsNum } = options.get()
    const { oldURL, newURL } = data
    const { relative: from } = parseUrlToObj(oldURL)
    const { relative: to } = parseUrlToObj(newURL)
    if (to) {
      urls.push(to)
    }
    urls = takeRight(urls, historyUrlsNum)
    eventTrack.add({
      type: EventType.HashChange,
      data: {
        from,
        to,
        urls: [...urls],
      },
      status: StatusType.Ok,
      time: getTimestamp(),
    })
  }
}

const historyCallback = () => {
  let urls: any[] = []
  return (data: IRouteParams) => {
    console.log('historyCallback', data)
    const { historyUrlsNum } = options.get()
    const { from, to } = data
    const { relative: currentFrom } = parseUrlToObj(from)
    const { relative: currentTo } = parseUrlToObj(to)
    const isSame = currentFrom === currentTo
    if (!isSame) {
      urls.push(to)
      urls = takeRight(urls, historyUrlsNum)
      eventTrack.add({
        type: EventType.History,
        data: {
          from: currentFrom || '/',
          to: currentTo || '/',
          urls: [...urls],
        },
        status: StatusType.Ok,
        time: getTimestamp(),
      })
    }
  }
}

const EventCollection = {
  // 监控全局的点击事件
  [EventType.Click]: (e: PointerEvent) => {
    const globalClickListeners = options.getGlobalClickListeners()
    const el = getTargetDomByPointerEvent(e) // 获取鼠标点击处的元素
    if (!el) return

    if (globalClickListeners.length) {
      globalClickListeners.forEach(({ selector, elementText, data = '' }) => {
        if (selector) {
          const els = document.querySelectorAll(selector)
          const isIncludes = [...(els as unknown as any[])].includes(el)
          isIncludes &&
            eventTrack.add({
              type: EventType.Click,
              data: data,
              status: StatusType.Ok,
              time: getTimestamp(),
            })
        } else if (el.textContent === elementText) {
          eventTrack.add({
            type: EventType.Click,
            data: data,
            status: StatusType.Ok,
            time: getTimestamp(),
          })
        }
      })
      return
    }

    const htmlString = htmlElementAsString(el)
    if (htmlString) {
      eventTrack.add({
        type: EventType.Click,
        data: htmlString,
        status: StatusType.Ok,
        time: getTimestamp(),
      })
    }
  },
  // 监听全局js错误
  [EventType.Error]: (e: IErrorTarget) => {
    // console.log(e)
    const { target, error, message } = e
    if (!target?.localName) {
      const stackFrame = ErrorStackParser.parse(!target ? e : error)[0]
      const { fileName, columnNumber: column, lineNumber: line } = stackFrame
      const errorData = {
        type: EventType.Error,
        message,
        fileName,
        line,
        column,
      }
      // eventTrack.add({
      //   data: errorData,
      //   time: getTimestamp(),
      //   status: StatusType.Error,
      // });
      report.send({
        type: EventType.Error,
        data: errorData,
        time: getTimestamp(),
        status: StatusType.Error,
      })
    }
  },
  // 监听hashchange
  [EventType.HashChange]: hashCallback(),
  // 监听history页路由
  [EventType.History]: historyCallback(),
  // 监听xhr、fetch
  [EventType.Http]: (data: HttpData, type: EventType.Fetch | EventType.XHR) => {
    // console.log(data, type)
    const result = httpTransform(data)
    const { url } = options.getReport()

    if (result.status === StatusType.Error) {
      // 上报接口错误
      report.send({
        type,
        data: result,
        status: StatusType.Error,
        time: data.time,
      })
      return
    }

    // 添加用户行为，去掉自身上报的接口行为
    if (!data.url.includes(url)) {
      eventTrack.add({
        type,
        data: result,
        status: StatusType.Ok,
        time: data.time,
      })
    }
  },
  // 监听promise异常
  [EventType.UnhandledRejection]: (e: PromiseRejectionEvent) => {
    console.log('UnhandledRejection', e)
    const stackFrame = ErrorStackParser.parse(e.reason)[0]
    const { fileName, columnNumber: column, lineNumber: line } = stackFrame
    const message = unknownToString(e.reason.message || e.reason.stack)
    const data = {
      message,
      fileName,
      line,
      column,
      type: EventType.UnhandledRejection,
    }
    // eventTrack.add({
    //   time: getTimestamp(),
    //   data,
    //   status: StatusType.Error,
    // });
    report.send({
      type: EventType.UnhandledRejection,
      time: getTimestamp(),
      data,
      status: StatusType.Error,
    })
  },
}

export default EventCollection

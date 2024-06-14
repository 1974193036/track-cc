import ErrorStackParser from 'error-stack-parser'
import takeRight from 'lodash/takeRight'
import { EventType, StatusType, type IErrorTarget } from '../../types'
import options from '../options'
import {
  getTargetDomByPointerEvent,
  getTimestamp,
  htmlElementAsString,
  parseUrlToObj,
} from '../../utils'
import eventTrack from './event'
import report from '../report'

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
    console.log(e)
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
}

export default EventCollection

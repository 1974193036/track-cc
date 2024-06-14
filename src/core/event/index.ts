import { EventType, StatusType } from '../../types'
import options from '../options'
import { getTargetDomByPointerEvent, getTimestamp, htmlElementAsString } from '../../utils'
import eventTrack from './event'

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
}

export default EventCollection

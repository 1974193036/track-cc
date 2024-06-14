import isElement from 'lodash/isElement'
import isFunction from 'lodash/isFunction'
// import isUndefined from 'lodash/isUndefined'
import { NATIVE_EVENTS } from '../configs'

type Event = (e?: any) => void

interface IParams {
  el: HTMLElement | Document | Window | XMLHttpRequest
  eventName: string
  event: Event
  capture?: boolean
}

const validEvent = ({ el, eventName, event }: IParams) => {
  const isEl =
    isElement(el) || [window, document].includes(el as any) || el instanceof XMLHttpRequest
  const isAllowEventName = NATIVE_EVENTS.includes(eventName)
  const isEventFn = isFunction(event)

  return isEl && isAllowEventName && isEventFn
}

export const on = ({ el, eventName, event, capture = false }: IParams) => {
  const validate = validEvent({
    el,
    eventName,
    event,
  })
  if (!validate) return
  el.addEventListener(eventName, event, capture)
}

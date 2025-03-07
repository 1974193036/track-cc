import { install, errorBoundaryReport, init } from './init'
import { default as reportData } from './report'
import { getTimestamp } from '../utils'
import eventTrack from './event/event'
import { EventType, ICustomEventParams, StatusType } from '../types'

const add = (params: ICustomEventParams) => {
  const { type, time, data } = params
  eventTrack.add({
    type: type || EventType.Click,
    time: time || getTimestamp(),
    data,
    status: StatusType.Ok,
  })
}

const report = (params: ICustomEventParams) => {
  const { type, time, data } = params
  reportData.send({
    type: type || EventType.Click,
    time: time || getTimestamp(),
    data,
    status: StatusType.Ok,
  })
}

const Track = {
  install, // 提供给vue注册
  errorBoundaryReport, // 提供给react
  init,
  add,
  report,
}

export default Track

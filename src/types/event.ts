import { IDeviceInfo } from './global'

export const enum StatusType {
  Ok = 'ok',
  Error = 'error',
}

export const enum EventType {
  WhiteScreen = 'white_screen',
  Performance = 'performance',
  XHR = 'xhr',
  Fetch = 'fetch',
  Error = 'error',
  History = 'history',
  UnhandledRejection = 'unhandled_rejection',
  Click = 'click',
  HashChange = 'hash_change',
  Http = 'http',
  Resource = 'resource',
}

export interface IEventParams {
  type: EventType
  time?: number
  data: any
  status: StatusType
}

export interface ICommonReportParams {
  userId: string
  domain: string
  href: string
  uuid: string
  userAgent: string
  deviceInfo: IDeviceInfo
}

export type IReportParams = IEventParams & ICommonReportParams

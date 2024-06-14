import { EventType, IReportParams } from './event'

type ICustomReport = (data: IReportParams[]) => any

export type UserIdType = string | (() => string)

export interface IReportOptions {
  headers?: Object | (() => Object) // 上报headers设置
  url: string // 上报url
  reportType?: 'img' | 'http' | 'beacon' // 上报方式
  format?: (data: any[]) => any // 格式化上报数据
  customReport?: ICustomReport // 自定义上报
  isReport?: (data: any[]) => boolean // 返回一个布尔值决定要不要上报
}

export type CacheType = 'normal' | 'storage' | 'db'

export interface IGlobalClickListenerItem {
  selector?: string
  elementText?: string
  data?: string
}

export interface ISwitch {
  xhr: boolean // xhr请求
  fetch: boolean // fetch请求
  error: boolean // 报错
  unhandledRejection: boolean // promise异常
  whitescreen: boolean // 白屏
  hashchange: boolean // hash变化
  history: boolean // history变化
  recordScreen: boolean // 录屏
  performance: boolean // 页面性能
}

export type SwitchMap = Record<EventType, boolean>

export interface IOptions {
  projectKey: string // 项目的key
  userId: UserIdType // 用户id
  report: IReportOptions
  cacheType?: CacheType // 数据缓存方式
  globalClickListeners?: IGlobalClickListenerItem[] // 对于某些DOM节点进行点击监听上报
  log?: boolean // 是否开启上报数据打印
  whiteBoxElements?: string[]
  skeletonProject?: boolean
  switchs?: Partial<ISwitch> // 上报数据开关
  maxEvents?: number // 上报阈值
  checkHttpStatus?: (data: any) => boolean // 判断响应数据是否是成功
  filterHttpUrl?: (url: string, method: string) => boolean // 过滤上报请求url
  historyUrlsNum?: number // 需要记录的url跳转数组
}

export type PartialOptions = Partial<IOptions>

export type IReportClassOptions = IReportOptions & { userId: UserIdType }

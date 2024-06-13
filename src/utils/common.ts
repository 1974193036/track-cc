import { _global } from './global'

// 获取当前时间戳
export const getTimestamp = () => Date.now()

// 获取当前域名
export const getCurrentDomain = () => _global.location.host

// 获取当前页面路径
export const getCurrentHref = () => _global.location.href

// 获取uuid
export const getUUID = (): string => {
  let d = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

// 获取user-agent
export const getUserAgent = () => navigator.userAgent

export const isSupportFetch = () => {
  return 'fetch' in _global
}

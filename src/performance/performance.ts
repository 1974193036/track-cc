import { Callback } from '../types'
import { onLCP, onFID, onCLS, onFCP, onTTFB } from 'web-vitals'
import { _global, on } from '../utils'

export function isSafari(): boolean {
  return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
}

export function getLCP(callback: Callback): void {
  const entryHandler = (list: any) => {
    for (const entry of list.getEntries()) {
      callback({
        name: 'LCP',
        value: entry.startTime,
        rating: entry.startTime > 2500 ? 'poor' : 'good',
      })
      observer.disconnect()
    }
  }
  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'largest-contentful-paint', buffered: true })
}

export function getFID(callback: Callback): void {
  const entryHandler = (entryList: any) => {
    for (const entry of entryList.getEntries()) {
      // 差值就是处理的延迟时间
      const value = entry.processingStart - entry.startTime
      callback({
        name: 'FID',
        value,
        rating: value > 100 ? 'poor' : 'good',
      })
      observer.disconnect()
    }
  }
  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'first-input', buffered: true })
}

export function getCLS(callback: Callback): void {
  let clsValue = 0
  let sessionValue = 0
  let sessionEntries: any[] = []

  const entryHandler = (entryList: any) => {
    for (const entry of entryList.getEntries()) {
      // 只将不带有最近用户输入标志的布局偏移计算在内
      if (!entry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0]
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1]
        // 如果条目与上一条目的相隔时间小于 1 秒且
        // 与会话中第一个条目的相隔时间小于 5 秒，那么将条目
        // 包含在当前会话中。否则，开始一个新会话。
        if (
          sessionValue &&
          entry.startTime - lastSessionEntry?.startTime < 1000 &&
          entry.startTime - firstSessionEntry?.startTime < 5000
        ) {
          sessionValue += entry.value
          sessionEntries.push(entry)
        } else {
          sessionValue = entry.value
          sessionEntries = [entry]
        }

        // 如果当前会话值大于当前 CLS 值，
        // 那么更新 CLS 及其相关条目
        if (sessionValue > clsValue) {
          clsValue = sessionValue
          // clsEntries = sessionEntries;
          observer.disconnect()

          callback({
            name: 'CLS',
            value: clsValue,
            rating: clsValue > 2500 ? 'poor' : 'good',
          })
        }
      }
    }
  }

  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'layout-shift', buffered: true })
}

export function getFCP(callback: Callback): void {
  const entryHandler = (list: any) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        callback({
          name: 'FCP',
          value: entry.startTime,
          rating: entry.startTime > 2500 ? 'poor' : 'good',
        })
        observer.disconnect()
      }
    }
  }
  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'paint', buffered: true })
}

export function getTTFB(callback: Callback): void {
  on({
    el: _global,
    eventName: 'load',
    event: () => {
      const { responseStart, requestStart } = _global.performance.timing
      const value = responseStart - requestStart
      callback({
        name: 'TTFB',
        value,
        rating: value > 100 ? 'poor' : 'good',
      })
    },
  })
}

export function getWebVitals(callback: Callback): void {
  // web-vitals 不兼容safari浏览器
  if (isSafari()) {
    getLCP(res => {
      callback(res)
    })
    getFID(res => {
      callback(res)
    })
    getCLS(res => {
      callback(res)
    })
    getFCP(res => {
      callback(res)
    })
    getTTFB(res => {
      callback(res)
    })
  } else {
    // Largest Contentful Paint 最大内容渲染图 | 代表在viewpoint中最大的页面元素加载的时间
    onLCP(res => {
      callback(res)
    })
    // First Input Delay 首次输入延迟 用户首次和页面交互（单击链接、点击按钮等）到页面响应交互的时间
    onFID(res => {
      callback(res)
    })
    // 布局偏移量
    onCLS(res => {
      callback(res)
    })
    // First Content Paint 首次内容绘制  是浏览器将第一个DOM渲染到屏幕的时间，可能是文本、图像、SVG等
    onFCP(res => {
      callback(res)
    })
    // 首个字节到达时间 发出页面请求到接收到应答数据第一个字节所花费的毫秒
    onTTFB(res => {
      callback(res)
    })
  }

  // 首屏加载时间
  getFirstScreenPaint(res => {
    const data = {
      name: 'FSP',
      value: res,
      rating: res > 2500 ? 'poor' : 'good',
    }
    callback(data)
  })
}

function getFirstScreenPaint(callback: Callback) {
  if ('requestIdleCallback' in _global) {
    requestIdleCallback(deadline => {
      // timeRemaining：表示当前空闲时间的剩余时间
      if (deadline.timeRemaining() > 0) {
        observeFirstScreenPaint(callback)
      }
    })
  } else {
    observeFirstScreenPaint(callback)
  }
}

// 外部通过callback 拿到首屏加载时间
let observer: MutationObserver
let entries: any[] = []
export function observeFirstScreenPaint(callback: Callback): void {
  const ignoreDOMList = ['STYLE', 'SCRIPT', 'LINK']
  observer = new MutationObserver((mutationList: any) => {
    checkDOMChange(callback)
    const entry = { children: [], startTime: 0 }
    for (const mutation of mutationList) {
      if (mutation.addedNodes.length && isInScreen(mutation.target)) {
        for (const node of mutation.addedNodes) {
          // 忽略掉以上标签的变化
          if (node.nodeType === 1 && !ignoreDOMList.includes(node.tagName) && isInScreen(node)) {
            entry.children.push(node as never)
          }
        }
      }
    }

    if (entry.children.length) {
      entries.push(entry)
      entry.startTime = new Date().getTime()
    }
  })
  observer.observe(document, {
    childList: true, // 监听添加或删除子节点
    subtree: true, // 监听整个子树
    characterData: true, // 监听元素的文本是否变化
    attributes: true, // 监听元素的属性是否变化
  })
}

const viewportWidth = _global.innerWidth
const viewportHeight = _global.innerHeight
// dom 对象是否在屏幕内
function isInScreen(dom: HTMLElement): boolean {
  const rectInfo = dom.getBoundingClientRect()
  if (rectInfo.left < viewportWidth && rectInfo.top < viewportHeight) {
    return true
  }
  return false
}

// 定时器循环监听dom的变化，当document.readyState === 'complete'时，停止监听
let timer: number
// 页面是否渲染完成
let isOnLoaded = false
// firstScreenPaint为首屏加载时间
let firstScreenPaint = 0
function checkDOMChange(callback: Callback) {
  cancelAnimationFrame(timer)
  timer = requestAnimationFrame(() => {
    if (document.readyState === 'complete') {
      isOnLoaded = true
    }
    if (isOnLoaded) {
      // 取消监听
      observer && observer.disconnect()
      // document.readyState === 'complete'时，计算首屏渲染时间
      firstScreenPaint = getRenderTime()
      entries = []
      callback && callback(firstScreenPaint)
      cancelAnimationFrame(timer)
    } else {
      checkDOMChange(callback)
    }
  })
}

function getRenderTime(): number {
  let startTime = 0
  entries.forEach(entry => {
    if (entry.startTime > startTime) {
      startTime = entry.startTime
    }
  })
  // performance.timing.navigationStart 页面的起始时间
  return startTime - performance.timing.navigationStart
}

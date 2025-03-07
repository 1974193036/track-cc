import { StatusType } from '../../types'
import { _global, __sunshine_track__ } from '../../utils'
import isString from 'lodash/isString'

/**
 * 检测页面是否白屏
 * @param {function} callback - 回调函数获取检测结果
 * @param {boolean} skeletonProject - 页面是否有骨架屏
 * @param {array} whiteBoxElements - 容器列表，默认值为['html', 'body', '#app', '#root']
 */

interface IOptions {
  skeletonProject: boolean
  whiteBoxElements: string[]
}

export function openWhiteScreen(
  callback: (status: StatusType) => void,
  { skeletonProject = false, whiteBoxElements = [] }: IOptions,
) {
  let _whiteLoopNum = 0
  const _skeletonInitList: any = [] // 存储初次采样点
  let _skeletonNowList: any = [] // 存储当前采样点

  // 项目有骨架屏
  if (skeletonProject) {
    if (document.readyState !== 'complete') {
      idleCallback()
    }
  } else {
    // 页面加载完毕
    if (document.readyState === 'complete') {
      idleCallback()
    } else {
      _global.addEventListener('load', idleCallback)
    }
  }

  function idleCallback() {
    if ('requestIdleCallback' in _global) {
      requestIdleCallback(deadline => {
        // timeRemaining：表示当前空闲时间的剩余时间
        if (deadline.timeRemaining() > 0) {
          sampling()
        }
      })
    } else {
      sampling()
    }
  }

  // 采样对比
  function sampling() {
    let emptyPoints = 0
    for (let i = 1; i <= 9; i++) {
      const xElements = document.elementsFromPoint(
        (_global.innerWidth * i) / 10,
        _global.innerHeight / 2,
      )
      const yElements = document.elementsFromPoint(
        _global.innerWidth / 2,
        (_global.innerHeight * i) / 10,
      )
      if (isContainer(xElements[0] as HTMLElement)) emptyPoints++
      // 中心点只计算一次
      if (i !== 5) {
        if (isContainer(yElements[0] as HTMLElement)) emptyPoints++
      }
    }

    // 页面正常渲染，停止轮训
    if (emptyPoints !== 17) {
      if (skeletonProject) {
        // 第一次不比较
        if (!_whiteLoopNum) return openWhiteLoop()
        // 比较前后dom是否一致
        if (_skeletonNowList.join() == _skeletonInitList.join()) return callback(StatusType.Error)
      }
      if (__sunshine_track__._loopTimer) {
        clearTimeout(__sunshine_track__._loopTimer)
        __sunshine_track__._loopTimer = null
      }
    } else {
      // 开启轮训
      if (!__sunshine_track__._loopTimer) {
        openWhiteLoop()
      }
    }
    // 17个点都是容器节点算作白屏
    callback(emptyPoints === 17 ? StatusType.Error : StatusType.Ok)
  }

  // 开启白屏轮训
  function openWhiteLoop(): void {
    if (__sunshine_track__._loopTimer) return
    __sunshine_track__._loopTimer = setInterval(() => {
      if (skeletonProject) {
        _whiteLoopNum++
        _skeletonNowList = []
      }
      idleCallback()
    }, 1000)
  }

  // 选中dom点的名称
  function getSelector(element: any) {
    if (isString(element.id)) {
      return '#' + element.id
    } else if (isString(element.className)) {
      return (
        '.' +
        element.className
          .split(' ')
          .filter((item: any) => !!item)
          .join('.')
      )
    } else {
      return element.nodeName.toLowerCase()
    }
  }

  // 判断采样点是否为容器节点
  function isContainer(element: HTMLElement) {
    const selector = getSelector(element)
    if (skeletonProject) {
      _whiteLoopNum ? _skeletonNowList.push(selector) : _skeletonInitList.push(selector)
    }
    return whiteBoxElements?.indexOf(selector) !== -1
  }
}

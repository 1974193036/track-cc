import type { IOptions, ISwitch, PartialOptions, SwitchMap } from '../types'
import { EventType, PropType } from '../types'
import merge from 'lodash/merge'
import isArray from 'lodash/isArray'
import uniqBy from 'lodash/uniqBy'
import { __sunshine_track__, validTypes, setLogFlag } from '../utils'
import eventTrack from './event/event'
import report from './report'

const getInitOptions = (): IOptions => ({
  projectKey: '',
  userId: '',
  report: {
    url: '',
    headers: {},
    reportType: 'http',
  },
  log: false,
  cacheType: 'normal',
  whiteBoxElements: ['html', 'body', '#app', '#root'],
  skeletonProject: false,
  maxEvents: 10,
  historyUrlsNum: 3,
})

class Options {
  private options: IOptions = getInitOptions()
  private switchMap = {} as SwitchMap

  constructor(options?: IOptions) {
    if (options) {
      this.options = options
    }
  }

  get() {
    const {
      projectKey,
      userId = '',
      log = false,
      cacheType = 'normal',
      whiteBoxElements = [],
      skeletonProject = false,
      maxEvents = 10,
      filterHttpUrl,
      checkHttpStatus,
      historyUrlsNum,
    } = this.options
    return {
      projectKey,
      userId,
      log,
      cacheType,
      whiteBoxElements,
      skeletonProject,
      report: this.getReport(),
      globalClickListeners: this.getGlobalClickListeners(),
      maxEvents,
      filterHttpUrl,
      checkHttpStatus,
      historyUrlsNum,
    }
  }

  set(o: PartialOptions) {
    const { options } = this
    this.options = merge(options, o)
    this.setSwitchMap()
    this.validate()
  }

  setSwitchMap() {
    const { xhr, fetch, error, whitescreen, hashchange, history, performance, unhandledRejection } =
      this.getSwitchs()
    this.switchMap[EventType.XHR] = xhr
    this.switchMap[EventType.Fetch] = fetch
    this.switchMap[EventType.UnhandledRejection] = unhandledRejection
    this.switchMap[EventType.Error] = error
    this.switchMap[EventType.WhiteScreen] = whitescreen
    this.switchMap[EventType.HashChange] = hashchange
    this.switchMap[EventType.History] = history
    this.switchMap[EventType.Performance] = performance
  }

  getSwitchs(): ISwitch {
    const { switchs = {} } = this.options
    const {
      xhr = false,
      fetch = false,
      error = false,
      whitescreen = false,
      hashchange = false,
      history = false,
      recordScreen = false,
      performance = false,
      unhandledRejection = false,
    } = switchs

    return {
      xhr,
      fetch,
      error,
      whitescreen,
      hashchange,
      history,
      recordScreen,
      performance,
      unhandledRejection,
    }
  }

  getSwitchMap() {
    return this.switchMap
  }

  getReport() {
    const { report } = this.options
    return report
  }

  getGlobalClickListeners() {
    const { globalClickListeners } = this.options
    if (!isArray(globalClickListeners)) return []
    return uniqBy(globalClickListeners, o => `${o.selector}${o.elementText}${o.data}`)
  }

  validate() {
    const { report, projectKey } = this.options
    const { url } = report || {}
    // 校验必填项
    validTypes([
      { field: 'projectKey', type: PropType.String, value: projectKey },
      { field: 'url', type: PropType.Dns, value: url },
    ])
  }
}

const options = new Options()

__sunshine_track__.options = options

// console.log('__sunshine_track__', __sunshine_track__)

export const setupOptions = (o: IOptions) => {
  options.set(o)
  const { report: reportOptions, cacheType, maxEvents, projectKey, log, userId } = options.get()
  console.log('options', options.get())
  eventTrack.setOptions({
    cacheType,
    projectKey,
    maxEvents,
  })
  report.setOptions({
    ...reportOptions,
    userId,
  })
  setLogFlag(log)
}

export default options

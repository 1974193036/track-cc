import { getWebVitals } from './performance'
import { _global, getTimestamp } from '../utils'
import { StatusType } from '../types'

export default class WebPerformance {
  constructor({ report }: any) {
    // 获取FCP、LCP、TTFB、FID等指标
    getWebVitals((res: any) => {
      // name指标名称、rating 评级、value数值
      console.log(res)
      const { name, rating, value } = res
      report.send({
        type: 'performance',
        category: 'performance',
        status: StatusType.Ok,
        time: getTimestamp(),
        data: {
          name,
          rating,
          value,
        },
      })
    })
  }
}

import type { IOptions } from '../types'
import { setupOptions } from './options'

export const init = (options: IOptions) => {
  setupOptions(options)
}

import type { IOptions } from '../types'
import { setupOptions } from './options'
import { setupReplace } from './setup'

export const init = (options: IOptions) => {
  setupOptions(options)
  setupReplace()
}

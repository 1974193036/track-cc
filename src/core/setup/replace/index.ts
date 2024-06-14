import options from '../../options'
import { EventType } from '../../../types'
import EventCollection from '../../event'
import { addListenOrReplace } from './replace'

export const setupReplace = () => {
  const switchMap = options.getSwitchMap()
  console.log('switchMap', switchMap)
  const globalClickListeners = options.getGlobalClickListeners()
  console.log('globalClickListeners', globalClickListeners)
  globalClickListeners.length &&
    addListenOrReplace({
      type: EventType.Click,
      callback: EventCollection[EventType.Click],
    })
}

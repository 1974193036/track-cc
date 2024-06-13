import { TrackStorage } from '../../../utils'
import { STORAGE_KEY_SUFFIX, STORAGE_VERSION } from '../../../configs'

export const storage = new TrackStorage({
  suffix: STORAGE_KEY_SUFFIX,
  version: STORAGE_VERSION,
})

// todo
// export const db = new TrackIndexedDB<IEventParams>({
//   dbNamesuffix: DB_NAME_SUFFIX,
//   dbVersion: DB_VERSION,
//   stores: [{ name: DB_EVENT_STORE_NAME, params: { keyPath: DB_EVENT_STORE_PRIMARY_KEY } }]
// })

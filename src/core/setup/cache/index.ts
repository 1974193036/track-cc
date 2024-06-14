import type { IOptions } from '../../../types'
import { storage } from './cache'
import isArray from 'lodash/isArray'

const setupStorage = (projectKey: string) => {
  const v = storage.getItem(projectKey)
  if (!isArray(v)) {
    storage.setItem(`${projectKey}`, [])
  }
}

export const setupCache = (options: IOptions) => {
  const { cacheType, projectKey } = options
  // 根据 cacheType 去初始化
  switch (cacheType) {
    case 'storage':
      setupStorage(projectKey)
      break
    // todo
    // case 'db':
    //   await setupDB(projectKey);
    //   break;
    default:
      break
  }
}

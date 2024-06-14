import { IAnyObject } from './base'

export interface ViewModel {
  [key: string]: any
  $root?: Record<string, unknown>
  $options?: {
    [key: string]: any
    name?: string
    propsData?: IAnyObject
    _componentTag?: string
    __file?: string
    props?: IAnyObject
  }
  $props?: Record<string, unknown>
}

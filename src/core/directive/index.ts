import { DIRECTIVE_NAME } from '../../configs'
import directive from './directive'

export const setupDirective = (Vue: any) => {
  Vue.directive(DIRECTIVE_NAME, directive)
}

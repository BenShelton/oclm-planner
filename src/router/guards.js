import store from '@/store'
import routes from './routes'

// Global Guards
export function authenticationGuard (to, from, next) {
  if (!to.meta.open && !store.getters['auth/token']) {
    next({ name: routes.LOGIN })
  } else {
    next()
  }
}

import store from '@/store'
import routes from './routes'

// Global Guards
export function authenticationGuard (to, from, next) {
  // Check if a token is stored (doesn't validate until an api call)
  if (store.getters['auth/hasToken']) {
    // If on Login redirect to Home, otherwise allow anything, any api calls will validate the token
    next(to.name === routes.LOGIN ? { name: routes.HOME } : undefined)
  } else {
    // If not on an 'open' route redirect to Login
    next(!to.meta.open ? { name: routes.LOGIN } : undefined)
  }
}

export function congregationGuard (to, from, next) {
  if (!to.meta.open && !store.getters['congregation/members'].length) {
    store.dispatch('congregation/load')
  }
  next()
}

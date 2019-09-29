import { NavigationGuard } from 'vue-router/types/router'

import { authModule, congregationModule } from '@/store'
import routes from './routes'

// Global Guards
export const authenticationGuard: NavigationGuard = function (to, from, next): void {
  // Check if a token is stored (doesn't validate until an api call)
  if (authModule.hasToken) {
    // If on Login redirect to Home, otherwise allow anything, any api calls will validate the token
    next(to.name === routes.LOGIN ? { name: routes.HOME } : undefined)
  } else {
    // If not on an 'open' route redirect to Login
    next(!to.meta.open ? { name: routes.LOGIN } : undefined)
  }
}

export const congregationGuard: NavigationGuard = function (to, from, next): void {
  if (!to.meta.open && !congregationModule.members.length) {
    congregationModule.load()
  }
  next()
}

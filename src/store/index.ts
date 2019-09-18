import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { getModule } from 'vuex-module-decorators'

import alert from './modules/alert'
import auth from './modules/auth'
import congregation from './modules/congregation'
import drawer from './modules/drawer'
import schedule from './modules/schedule'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    alert,
    auth,
    congregation,
    drawer,
    schedule
  },
  plugins: [createPersistedState({
    paths: ['auth', 'schedule.language']
  })]
})

export default store

export const alertModule = getModule(alert, store)
export const authModule = getModule(auth, store)
export const congregationModule = getModule(congregation, store)
export const drawerModule = getModule(drawer, store)
export const scheduleModule = getModule(schedule, store)

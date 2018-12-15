import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import auth from './auth'
import congregation from './congregation'
import drawer from './drawer'
import schedule from './schedule'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    congregation,
    drawer,
    schedule
  },
  plugins: [createPersistedState({
    paths: ['auth']
  })]
})

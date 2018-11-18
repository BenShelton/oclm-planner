import Vue from 'vue'
import Vuex from 'vuex'

import congregation from './congregation'
import drawer from './drawer'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    congregation,
    drawer
  }
})

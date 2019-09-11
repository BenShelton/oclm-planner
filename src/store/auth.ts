import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

import store from './index'
import api from '@/api'

@Module({
  store,
  dynamic: true,
  namespaced: true,
  name: 'auth'
})
export default class Auth extends VuexModule {
  // State
  token: string = ''

  // Getters
  get hasToken (): boolean {
    return !!this.token
  }

  // Actions
  @Action
  async login ({ password }: { password: string }) {
    const { commit } = this.context
    commit('CLEAR_TOKEN')
    const res = await api.auth.login({ password })
    commit('UPDATE_TOKEN', res.data.result)
  }

  @Action
  async logout () {
    await api.auth.logout()
    this.context.commit('CLEAR_TOKEN')
  }

  // Mutations
  @Mutation
  UPDATE_TOKEN (payload: string) {
    this.token = payload
  }

  @Mutation
  CLEAR_TOKEN () {
    this.token = ''
  }
}

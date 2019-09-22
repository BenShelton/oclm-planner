import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

import api from '@/api'

@Module({ namespaced: true, name: 'auth' })
export default class Auth extends VuexModule {
  // State
  token: string = ''

  // Getters
  get hasToken (): boolean {
    return !!this.token
  }

  // Actions
  @Action
  async login ({ password }: { password: string }): Promise<void> {
    const { commit } = this.context
    commit('CLEAR_TOKEN')
    const res = await api.auth.login({ password })
    commit('UPDATE_TOKEN', res.data.result.token)
  }

  @Action
  async logout (): Promise<void> {
    await api.auth.logout()
    this.context.commit('CLEAR_TOKEN')
  }

  // Mutations
  @Mutation
  UPDATE_TOKEN (payload: string): void {
    this.token = payload
  }

  @Mutation
  CLEAR_TOKEN (): void {
    this.token = ''
  }
}

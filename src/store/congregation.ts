import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

import { CongregationMember } from '@/ts/interfaces'
import store from './index'
import api from '@/api'

interface IdMap {
  [key: string]: CongregationMember
}

@Module({
  store,
  dynamic: true,
  namespaced: true,
  name: 'auth'
})
export default class Alert extends VuexModule {
  // State
  members: CongregationMember[] = []
  loading: boolean = true

  // Getters
  get activeMembers () {
    return this.members.filter(m => m.show)
  }

  get idMap (): IdMap {
    return this.members.reduce((acc, { _id, name }) => Object.assign(acc, { [_id]: { name } }), {})
  }

  // Actions
  @Action
  async load () {
    const { commit } = this.context
    commit('START_LOADING')
    const res = await api.congregation.members()
    commit('LOAD_MEMBERS', res.data.result)
  }

  @Action
  async add (payload: CongregationMember) {
    const { commit } = this.context
    commit('START_LOADING')
    const res = await api.congregation.addMember(payload)
    commit('ADD_MEMBER', res.data.result)
  }

  @Action
  async update ({ memberID, member }: { memberID: string, member: CongregationMember }) {
    const { commit } = this.context
    commit('START_LOADING')
    const res = await api.congregation.updateMember({ memberID, member })
    commit('UPDATE_MEMBER', res.data.result)
  }

  @Action
  async delete ({ memberID }: { memberID: string }) {
    const { commit } = this.context
    commit('START_LOADING')
    await api.congregation.deleteMember({ memberID })
    commit('DELETE_MEMBER', memberID)
  }

  // Mutations
  @Mutation
  LOAD_MEMBERS (payload: CongregationMember[]) {
    this.members = payload
    this.loading = false
  }

  @Mutation
  ADD_MEMBER (payload: CongregationMember) {
    this.members.push(payload)
    this.loading = false
  }

  @Mutation
  UPDATE_MEMBER (payload: CongregationMember) {
    const existingMember = this.members.find(m => m._id === payload._id)
    Object.assign(existingMember, payload)
    this.loading = false
  }

  @Mutation
  DELETE_MEMBER (payload: string) {
    const existingMemberIndex = this.members.findIndex(m => m._id === payload)
    this.members.splice(existingMemberIndex, 1)
    this.loading = false
  }

  @Mutation
  START_LOADING () {
    this.loading = true
  }
}

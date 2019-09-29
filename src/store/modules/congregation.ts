import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

import { ICongregationMember } from 'types'
import api from '@/api'

interface IIdMap {
  [key: string]: ICongregationMember
}

@Module({ namespaced: true, name: 'congregation' })
export default class Alert extends VuexModule {
  // State
  members: ICongregationMember[] = []
  loading: boolean = true

  // Getters
  get activeMembers (): ICongregationMember[] {
    return this.members.filter(m => m.show)
  }

  get idMap (): IIdMap {
    return this.members.reduce((acc: IIdMap, { _id, name }) => Object.assign(acc, { [_id]: { name } }), {})
  }

  // Actions
  @Action
  async load (): Promise<void> {
    const { commit } = this.context
    commit('START_LOADING')
    const res = await api.congregation.members()
    commit('LOAD_MEMBERS', res.data.result)
  }

  @Action
  async add (payload: ICongregationMember): Promise<void> {
    const { commit } = this.context
    commit('START_LOADING')
    const res = await api.congregation.addMember(payload)
    commit('ADD_MEMBER', res.data.result)
  }

  @Action
  async update ({ memberID, member }: { memberID: string, member: ICongregationMember }): Promise<void> {
    const { commit } = this.context
    commit('START_LOADING')
    const res = await api.congregation.updateMember({ memberID, member })
    commit('UPDATE_MEMBER', res.data.result)
  }

  @Action
  async delete ({ memberID }: { memberID: string }): Promise<void> {
    const { commit } = this.context
    commit('START_LOADING')
    await api.congregation.deleteMember({ memberID })
    commit('DELETE_MEMBER', memberID)
  }

  // Mutations
  @Mutation
  LOAD_MEMBERS (payload: ICongregationMember[]): void {
    this.members = payload
    this.loading = false
  }

  @Mutation
  ADD_MEMBER (payload: ICongregationMember): void {
    this.members.push(payload)
    this.loading = false
  }

  @Mutation
  UPDATE_MEMBER (payload: ICongregationMember): void {
    const existingMember = this.members.find(m => m._id === payload._id)
    Object.assign(existingMember, payload)
    this.loading = false
  }

  @Mutation
  DELETE_MEMBER (payload: string): void {
    const existingMemberIndex = this.members.findIndex(m => m._id === payload)
    this.members.splice(existingMemberIndex, 1)
    this.loading = false
  }

  @Mutation
  START_LOADING (): void {
    this.loading = true
  }
}

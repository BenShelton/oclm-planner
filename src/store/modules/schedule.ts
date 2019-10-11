import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

import api from '@/api'
import { IScheduleAssignment, ScheduleWeek, Languages, Assignments } from 'types'

@Module({ namespaced: true, name: 'schedule' })
export default class Schedule extends VuexModule {
  // State
  weeks: ScheduleWeek[] = []
  month: ScheduleWeek[] = []
  loadedMonth: string = ''
  selectedAssignee: string = ''
  language: Languages = 'en'

  // Actions
  @Action
  async loadWeek ({ date }: { date: string }): Promise<ScheduleWeek> {
    const { commit } = this.context
    const week = this.weeks.find(w => w.date === date)
    if (week) return Promise.resolve(week)
    const res = await api.schedule.week({ date })
    const resWeek = res.data.result
    commit('LOAD_WEEK', resWeek)
    return resWeek
  }

  @Action
  async loadMonth ({ month }: { month: string }): Promise<ScheduleWeek[]> {
    const { commit } = this.context
    if (this.loadedMonth === month && this.month) return Promise.resolve(this.month)
    const res = await api.schedule.month({ month })
    const weeks = res.data.result
    commit('LOAD_MONTH', { month: weeks, loadedMonth: month })
    return weeks
  }

  @Action
  async scrapeWeek ({ weekID }: { weekID: string }): Promise<ScheduleWeek> {
    const { commit } = this.context
    const { language } = this
    const res = await api.schedule.scrape({ weekID, language })
    const scrapedWeek = res.data.result
    commit('UPDATE_WEEK', scrapedWeek)
    return scrapedWeek
  }

  @Action
  async updateAssignment ({ weekID, name, assignment }: { weekID: string, name: Assignments, assignment: IScheduleAssignment }): Promise<ScheduleWeek> {
    const { commit } = this.context
    const { language } = this
    const res = await api.schedule.updateAssignment({ weekID, language, name, assignment })
    const { week, members } = res.data.result
    commit('UPDATE_WEEK', week)
    for (const member of members) {
      commit('congregation/UPDATE_MEMBER', member, { root: true })
    }
    return week
  }

  @Action
  async deleteAssignment ({ weekID, name }: { weekID: string, name: Assignments }): Promise<ScheduleWeek> {
    const { commit } = this.context
    const { language } = this
    const res = await api.schedule.deleteAssignment({ weekID, language, name })
    const { week, members } = res.data.result
    commit('UPDATE_WEEK', week)
    for (const member of members) {
      commit('congregation/UPDATE_MEMBER', member, { root: true })
    }
    return week
  }

  @Action
  async updateWeekType ({ weekID, type }: { weekID: string, type: number }): Promise<ScheduleWeek> {
    const { commit } = this.context
    const { language } = this
    const res = await api.schedule.updateWeekType({ weekID, language, type })
    const { week, members } = res.data.result
    commit('UPDATE_WEEK', week)
    for (const member of members) {
      commit('congregation/UPDATE_MEMBER', member, { root: true })
    }
    return week
  }

  @Action
  async updateCOName ({ weekID, name }: { weekID: string, name: string }): Promise<ScheduleWeek> {
    const { commit } = this.context
    const { language } = this
    const res = await api.schedule.updateCOName({ weekID, language, name })
    const week = res.data.result
    commit('UPDATE_WEEK', week)
    return week
  }

  @Action
  async updateCOTitle ({ weekID, title }: { weekID: string, title: string }): Promise<ScheduleWeek> {
    const { commit } = this.context
    const { language } = this
    const res = await api.schedule.updateCOTitle({ weekID, language, title })
    const week = res.data.result
    commit('UPDATE_WEEK', week)
    return week
  }

  // Mutations
  @Mutation
  LOAD_WEEK (payload: ScheduleWeek): void {
    this.weeks.push(payload)
  }

  @Mutation
  UPDATE_WEEK (payload: ScheduleWeek): void {
    const prevIndex = this.weeks.findIndex(w => w._id === payload._id)
    if (prevIndex === -1) this.weeks.push(payload)
    else this.weeks.splice(prevIndex, 1, payload)
  }

  @Mutation
  CLEAR_WEEKS (): void {
    this.weeks = []
  }

  @Mutation
  LOAD_MONTH ({ month, loadedMonth }: { month: ScheduleWeek[], loadedMonth: string }): void {
    this.month = month
    this.loadedMonth = loadedMonth
  }

  @Mutation
  CLEAR_MONTH (): void {
    this.month = []
  }

  @Mutation
  UPDATE_SELECTED_ASSIGNEE (payload: string): void {
    this.selectedAssignee = payload
  }

  @Mutation
  UPDATE_LANGUAGE (payload: Languages): void {
    this.language = payload
  }
}

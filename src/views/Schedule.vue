<template>
  <v-layout fill-height column>
    <v-layout class="elevation-1 mx-2">
      <v-btn icon @click="shiftCurrentWeek(-4)">
        <v-icon>skip_previous</v-icon>
      </v-btn>
      <v-btn class="flip" icon @click="shiftCurrentWeek(-1)">
        <v-icon>play_arrow</v-icon>
      </v-btn>
      <v-spacer />
      <v-dialog v-model="dateDialog" lazy width="290px">
        <v-btn slot="activator" color="primary" @click="dateDialog = true">
          Select Week
        </v-btn>
        <v-date-picker v-model="currentWeek" :allowed-dates="allowedDates" @input="dateDialog = false" />
      </v-dialog>
      <v-spacer />
      <v-btn icon @click="shiftCurrentWeek(1)">
        <v-icon>play_arrow</v-icon>
      </v-btn>
      <v-btn icon @click="shiftCurrentWeek(4)">
        <v-icon>skip_next</v-icon>
      </v-btn>
    </v-layout>
    <v-layout justify-center fill-height>
      <v-flex
        v-for="week of visibleWeeks"
        :key="week.weekDate"
        class="ma-2 xs12 sm6 md4 lg3 xl2"
      >
        <ScheduleWeekView
          :week-date="week.weekDate"
          :current="week.current"
        />
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { NavigationGuard } from 'vue-router/types/router'

import ScheduleWeekView from '@/components/Schedule/ScheduleWeekView.vue'
import { scheduleModule } from '@/store'

@Component({
  components: {
    ScheduleWeekView
  }
})
export default class Schedule extends Vue {
  // Data
  currentWeek: string = this.weekStart(new Date())
  dateDialog: boolean = false

  // Hooks
  beforeRouteLeave: NavigationGuard = function (to, from, next) {
    scheduleModule.CLEAR_WEEKS()
    next()
  }

  // Computed
  get bufferBefore (): number {
    switch (this.$vuetify.breakpoint.name) {
      case 'sm':
        return 1
      case 'md':
      case 'lg':
        return 2
      case 'xl':
        return 3
      default:
        return 0
    }
  }

  get bufferAfter (): number {
    switch (this.$vuetify.breakpoint.name) {
      case 'lg':
        return 1
      case 'xl':
        return 2
      default:
        return 0
    }
  }

  get visibleWeeks (): { weekDate: string, current: boolean }[] {
    const { bufferBefore, bufferAfter } = this
    const weeks = []
    for (let i = -bufferBefore; i <= bufferAfter; i++) {
      const current = i === 0
      weeks.push({
        weekDate: current ? this.currentWeek : this.addWeek(this.currentWeek, i),
        current
      })
    }
    return weeks
  }

  // Methods
  allowedDates (date: string): boolean {
    return new Date(date).getDay() === 1
  }

  weekStart (date: Date): string {
    const outputDate = new Date(date)
    const daysSinceMonday = outputDate.getDay() - 1
    outputDate.setDate(outputDate.getDate() - daysSinceMonday)
    return this.getDateString(outputDate)
  }

  addWeek (date: string, weeks: number): string {
    const outputDate = new Date(date)
    const days = weeks * 7
    outputDate.setUTCDate(outputDate.getUTCDate() + days)
    return this.getDateString(outputDate)
  }

  shiftCurrentWeek (weeks: number): void {
    this.currentWeek = this.addWeek(this.currentWeek, weeks)
  }

  getDateString (date: Date): string {
    return date.toISOString().split('T')[0]
  }
}
</script>

<style lang="stylus" scoped>
.flip
  transform scaleX(-1)
</style>

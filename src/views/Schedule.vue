<template>
  <v-layout fill-height justify-center>
    <ScheduleWeek
      v-for="week in visibleWeeks"
      :key="week.weekDate"
      class="ma-2"
      :week-date="week.weekDate"
      :current="week.current"
    />
  </v-layout>
</template>

<script>
import ScheduleWeek from '@/components/ScheduleWeek'

export default {
  name: 'Schedule',

  components: { ScheduleWeek },

  data () {
    return {
      currentWeek: this.weekStart(new Date())
    }
  },

  computed: {
    visibleWeeks () {
      const bufferBefore = 2
      const bufferAfter = 1
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
  },

  methods: {
    weekStart (date) {
      const outputDate = new Date(date)
      const daysSinceMonday = outputDate.getDay() - 1
      outputDate.setDate(outputDate.getDate() - daysSinceMonday)
      return this.getDateString(outputDate)
    },
    addWeek (date, weeks) {
      const outputDate = new Date(date)
      const days = weeks * 7
      outputDate.setDate(outputDate.getDate() + days)
      return this.getDateString(outputDate)
    },
    getDateString (date) {
      return date.toISOString().split('T')[0]
    }
  }
}
</script>

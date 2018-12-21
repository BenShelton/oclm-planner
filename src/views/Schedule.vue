<template>
  <VLayout fill-height column>
    <VLayout class="elevation-1 mx-2">
      <VBtn icon @click="shiftCurrentWeek(-4)">
        <VIcon>skip_previous</VIcon>
      </VBtn>
      <VBtn class="flip" icon @click="shiftCurrentWeek(-1)">
        <VIcon>play_arrow</VIcon>
      </VBtn>
      <VSpacer />
      <VBtn icon @click="shiftCurrentWeek(1)">
        <VIcon>play_arrow</VIcon>
      </VBtn>
      <VBtn icon @click="shiftCurrentWeek(4)">
        <VIcon>skip_next</VIcon>
      </VBtn>
    </VLayout>
    <VLayout justify-center fill-height>
      <VFlex
        v-for="week in visibleWeeks"
        :key="week.weekDate"
        class="ma-2 xs12 sm6 md4 lg3 xl2"
      >
        <ScheduleWeek
          :week-date="week.weekDate"
          :current="week.current"
        />
      </VFlex>
    </VLayout>
  </VLayout>
</template>

<script>
import ScheduleWeek from '@/components/Schedule/ScheduleWeek'

export default {
  name: 'Schedule',

  components: { ScheduleWeek },

  data () {
    return {
      currentWeek: this.weekStart(new Date())
    }
  },

  computed: {
    bufferBefore () {
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
    },
    bufferAfter () {
      switch (this.$vuetify.breakpoint.name) {
        case 'lg':
          return 1
        case 'xl':
          return 2
        default:
          return 0
      }
    },
    visibleWeeks () {
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
      outputDate.setUTCDate(outputDate.getUTCDate() + days)
      return this.getDateString(outputDate)
    },
    shiftCurrentWeek (weeks) {
      this.currentWeek = this.addWeek(this.currentWeek, weeks)
    },
    getDateString (date) {
      return date.toISOString().split('T')[0]
    }
  }
}
</script>

<style lang="stylus" scoped>
.flip
  transform scaleX(-1)
</style>

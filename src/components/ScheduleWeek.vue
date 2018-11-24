<template>
  <v-card>
    <v-toolbar :color="toolbarColor">
      <v-toolbar-title v-text="prettyDate" />
    </v-toolbar>
    <v-layout v-if="!week" justify-center class="pa-3">
      <v-layout v-if="loadError" column align-center>
        <v-icon color="red">warning</v-icon>
        <p class="red--text">An error occured when loading this week.</p>
      </v-layout>
      <v-progress-circular v-else indeterminate color="primary" />
    </v-layout>
    <v-list v-else two-line subheader>
      <ScheduleAssignment :assignment="assignments.chairman" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.openingPrayer" @edit="onEdit" />

      <v-subheader class="grey darken-2 white--text">TREASURES FROM GOD'S WORD</v-subheader>
      <v-divider />
      <ScheduleAssignment :assignment="assignments.talk" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.gems" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.bibleReading" @edit="onEdit" />

      <v-subheader class="yellow darken-3 white--text">APPLY YOURSELF TO THE FIELD MINISTRY</v-subheader>
      <v-divider />
      <ScheduleAssignment :assignment="assignments.studentTalk1" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.studentTalk2" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.studentTalk3" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.studentTalk4" @edit="onEdit" />

      <v-subheader class="red darken-2 white--text">LIVING AS CHRISTIANS</v-subheader>
      <v-divider />
      <ScheduleAssignment :assignment="assignments.serviceTalk1" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.serviceTalk2" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.congregationBibleStudy" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.reader" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.closingPrayer" @edit="onEdit" />
    </v-list>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'

import ScheduleAssignment from '@/components/ScheduleAssignment'

export default {
  name: 'ScheduleWeek',

  components: { ScheduleAssignment },

  props: {
    weekDate: { type: String, required: true },
    current: { type: Boolean, required: true }
  },

  mounted () {
    this.loadWeek(this.weekDate)
      .then(week => { this.week = week })
      .catch(err => {
        this.loadError = true
        console.error(err)
      })
  },

  data () {
    return {
      week: null,
      loadError: false
    }
  },

  computed: {
    toolbarColor () {
      return this.current ? 'primary' : 'grey'
    },
    prettyDate () {
      const { weekDate } = this
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const [year, month, day] = weekDate.split('-')
      return `${day} ${months[month - 1]} ${year}`
    },
    assignments () {
      const { assignments } = this.week
      const assignmentRefs = [
        { name: 'chairman', displayName: 'Chairman' },
        { name: 'openingPrayer', displayName: 'Opening Prayer' },
        { name: 'talk', displayName: 'Talk' },
        { name: 'gems', displayName: 'Gems' },
        { name: 'bibleReading', displayName: 'Bible Reading' },
        { name: 'studentTalk1', displayName: 'Student Talk 1' },
        { name: 'studentTalk2', displayName: 'Student Talk 2' },
        { name: 'studentTalk3', displayName: 'Student Talk 3' },
        { name: 'studentTalk4', displayName: 'Student Talk 4' },
        { name: 'serviceTalk1', displayName: 'Service Talk 1' },
        { name: 'serviceTalk2', displayName: 'Service Talk 2' },
        { name: 'congregationBibleStudy', displayName: 'Congregation Bible Study' },
        { name: 'reader', displayName: 'Reader' },
        { name: 'closingPrayer', displayName: 'Closing Prayer' }
      ]
      return assignmentRefs.reduce((acc, { name, displayName }) => {
        return Object.assign(acc, {
          [name]: {
            name,
            displayName,
            details: assignments[name]
          }
        })
      }, {})
    }
  },

  methods: {
    ...mapActions({
      loadWeek: 'schedule/loadWeek'
    }),
    onEdit (name) {
      console.log(this.week.assignments[name])
    }
  }
}
</script>

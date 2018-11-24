<template>
  <v-card>
    <v-toolbar :color="toolbarColor">
      <v-toolbar-title v-text="prettyDate" />
    </v-toolbar>
    <v-list three-line subheader>
      <ScheduleAssignment :assignment="assignments.chairman" @edit="onEdit('chairman')" />
      <v-subheader class="red darken-2 white--text">Treasures from God's Word</v-subheader>
      <ScheduleAssignment :assignment="assignments.talk" @edit="onEdit('talk')" />
    </v-list>
  </v-card>
</template>

<script>
import ScheduleAssignment from '@/components/ScheduleAssignment'
export default {
  name: 'ScheduleWeek',

  components: { ScheduleAssignment },

  props: {
    weekDate: { type: String, required: true },
    current: { type: Boolean, required: true }
  },

  data () {
    return {
      assignments: {
        chairman: { name: 'Chairman', assignee: 'John Smith' },
        talk: {
          name: 'Talk',
          assignee: 'Ben Jones',
          title: 'Paul Appeals to Caesar and Then Witnesses to King Herod Agrippa',
          time: '10 min'
        }
      }
    }
  },

  computed: {
    toolbarColor () {
      return this.current ? 'blue' : 'grey'
    },
    prettyDate () {
      const { weekDate } = this
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const [year, month, day] = weekDate.split('-')
      return `${day} ${months[month - 1]} ${year}`
    }
  },

  methods: {
    onEdit (assignmentName) {
      console.log(this.assignments[assignmentName])
    }
  }
}
</script>

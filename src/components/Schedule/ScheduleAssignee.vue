<template>
  <v-chip
    class="mx-0 no-select"
    small
    :color="color"
    @click="onClick"
  >
    {{ assigneeName }}
  </v-chip>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

const DELETED = 'DELETED'

export default {
  name: 'ScheduleAssignee',

  props: {
    assignee: { type: String, default: '' },
    assistant: { type: Boolean }
  },

  computed: {
    ...mapGetters({
      loading: 'congregation/loading',
      idMap: 'congregation/idMap',
      selectedAssignee: 'schedule/selectedAssignee'
    }),
    assigneeName () {
      if (!this.assignee) return this.assistant ? 'Assistant Required' : 'Assignee Required'
      if (this.loading) return 'Loading...'
      const mappedMember = this.idMap[this.assignee]
      if (!mappedMember) return DELETED
      return mappedMember.name
    },
    isSelected () {
      return this.selectedAssignee === this.assignee
    },
    color () {
      if (!this.assignee || this.assigneeName === DELETED) return 'error'
      if (this.isSelected) return 'success'
      return ''
    }
  },

  methods: {
    ...mapMutations({
      selectAssignee: 'schedule/UPDATE_SELECTED_ASSIGNEE'
    }),
    onClick () {
      const { assignee, isSelected } = this
      this.selectAssignee(isSelected ? '' : assignee)
    }
  }
}
</script>

<template>
  <VChip
    class="ml-0 mr-2"
    small
    :color="color"
  >
    {{ assigneeName }}
  </VChip>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ScheduleAssignee',

  props: {
    assignee: { type: String, default: '' },
    assistant: { type: Boolean, default: false }
  },

  computed: {
    ...mapGetters({
      loading: 'congregation/loading',
      idMap: 'congregation/idMap'
    }),
    assigneeName () {
      if (!this.assignee) return this.assistant ? 'Assistant Required' : 'Assignee Required'
      if (this.loading) return 'Loading...'
      const mappedMember = this.idMap[this.assignee]
      if (!mappedMember) return 'DELETED'
      return mappedMember.name
    },
    color () {
      return !this.assignee || this.assigneeName === 'DELETED' ? 'error' : ''
    }
  }
}
</script>

<template>
  <v-hover>
    <div slot-scope="{ hover }">
      <v-list-tile class="py-2" :class="{ grey: !assignment.details }">
        <v-list-tile-content>
          <v-list-tile-title v-text="assignment.displayName" />
          <v-list-tile-sub-title v-if="!assignment.details">
            No Assignment Found
          </v-list-tile-sub-title>
          <template v-else>
            <v-list-tile-sub-title>
              <ScheduleAssignee :assignee="assignment.details.assignee" />
              <ScheduleAssignee v-if="hasAssistant" :assignee="assignment.details.assistant" />
            </v-list-tile-sub-title>
            <v-list-tile-sub-title v-text="assignment.details.title" />
          </template>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-list-tile-action-text v-if="assignment.details" v-text="assignment.details.time" />
          <v-btn v-show="hover" icon @click="onEdit">
            <v-icon>edit</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
      <v-divider />
    </div>
  </v-hover>
</template>

<script>
import ScheduleAssignee from '@/components/Schedule/ScheduleAssignee'

export default {
  name: 'ScheduleAssignment',

  components: { ScheduleAssignee },

  props: {
    assignment: { type: Object, required: true }
  },

  computed: {
    hasAssistant () {
      const { details } = this.assignment
      if (!details) return false
      return ['INITIAL_CALL', 'RETURN_VISIT', 'BIBLE_STUDY'].includes(details.type)
    }
  },

  methods: {
    onEdit () {
      this.$emit('edit', this.assignment.name)
    }
  }
}
</script>

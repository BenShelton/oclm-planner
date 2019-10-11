<template>
  <v-layout
    column
    class="schedule-assignment"
    :class="{ grey: !assignment.details, 'blue lighten-5': assignment.inherit || (assignment.details && assignment.details.stream) }"
  >
    <v-btn
      icon
      outline
      absolute
      right
      class="mt-2"
      @click="onEdit"
    >
      <v-icon>edit</v-icon>
    </v-btn>
    <v-layout align-center class="my-2 mx-3 subheading">
      <span class="mr-2" v-text="assignment.displayName" />
      <span v-if="assignment.inherit" class="primary--text font-weight-bold">
        (English)
      </span>
    </v-layout>
    <v-layout v-if="!assignment.details" class="mx-3">
      <span>No Assignment Found</span>
    </v-layout>
    <template v-else>
      <v-layout class="mx-3">
        <v-chip
          v-if="assignment.details.stream"
          small
          color="primary"
          class="white--text"
        >
          Streaming
        </v-chip>
        <v-layout v-else column>
          <v-layout>
            <ScheduleAssignee class="mr-1" :assignee="assignment.details.assignee" />
            <ScheduleAssignee v-if="hasAssistant" assistant :assignee="assignment.details.assistant" />
          </v-layout>
          <v-layout v-if="hasSecondSchool">
            <ScheduleAssignee class="mr-1" :assignee="assignment.details.assignee2" />
            <ScheduleAssignee assistant :assignee="assignment.details.assistant2" />
          </v-layout>
        </v-layout>
      </v-layout>
      <v-layout justify-center class="mx-3">
        <v-flex xs10 class="text-truncate" v-text="assignment.details.title" />
        <v-flex
          v-if="assignment.details"
          xs2
          class="caption grey--text text--darken-2 text-xs-right text-truncate"
          v-text="assignment.details.time"
        />
      </v-layout>
    </template>
    <v-divider class="mt-2" />
  </v-layout>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

import ScheduleAssignee from '@/components/Schedule/ScheduleAssignee.vue'
import { SECOND_SCHOOL } from '@/constants'
import { IScheduleWeekViewAssignment } from 'types'

export default Vue.extend({
  name: 'ScheduleAssignment',

  components: { ScheduleAssignee },

  props: {
    assignment: { type: Object as PropType<IScheduleWeekViewAssignment>, required: true }
  },

  computed: {
    hasAssistant (): boolean {
      const { details } = this.assignment
      if (!details) return false
      return ['initialCall', 'returnVisit', 'bibleStudy'].includes(details.type)
    },
    hasSecondSchool (): boolean {
      return SECOND_SCHOOL && this.hasAssistant
    }
  },

  methods: {
    onEdit (): void {
      this.$emit('edit', this.assignment.name)
    }
  }
})
</script>

<style lang="stylus" scoped>
.schedule-assignment
  min-height 100px
  position relative
</style>

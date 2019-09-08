<template>
  <v-layout
    column
    class="schedule-assignment"
    :class="{ grey: !assignment.details, 'blue lighten-5': assignment.inherit || assignment.stream }"
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
        <v-layout v-else>
          <ScheduleAssignee class="mr-1" :assignee="assignment.details.assignee" />
          <ScheduleAssignee v-if="hasAssistant" assistant :assignee="assignment.details.assistant" />
          <v-spacer />
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
      return ['initialCall', 'returnVisit', 'bibleStudy'].includes(details.type)
    }
  },

  methods: {
    onEdit () {
      this.$emit('edit', this.assignment.name)
    }
  }
}
</script>

<style lang="stylus" scoped>
.schedule-assignment
  height 100px
  position relative
</style>

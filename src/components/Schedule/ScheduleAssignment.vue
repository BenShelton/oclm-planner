<template>
  <VLayout
    column
    class="schedule-assignment"
    :class="{ grey: !assignment.details, 'blue lighten-5': assignment.inherit || assignment.stream }"
  >
    <VBtn
      icon
      outline
      absolute
      right
      class="mt-1"
      @click="onEdit"
    >
      <VIcon>edit</VIcon>
    </VBtn>
    <VLayout align-center class="my-2 mx-3 subheading">
      <span class="mr-2" v-text="assignment.displayName" />
      <span v-if="assignment.inherit" class="primary--text font-weight-bold">
        (English)
      </span>
    </VLayout>
    <VLayout v-if="!assignment.details" class="mx-3">
      <span>No Assignment Found</span>
    </VLayout>
    <template v-else>
      <VLayout class="mx-3">
        <VChip
          v-if="assignment.details.stream"
          small
          color="primary"
          class="white--text"
        >
          Streaming
        </VChip>
        <VLayout v-else>
          <ScheduleAssignee class="mr-1" :assignee="assignment.details.assignee" />
          <ScheduleAssignee v-if="hasAssistant" assistant :assignee="assignment.details.assistant" />
          <VSpacer />
        </VLayout>
      </VLayout>
      <VLayout justify-center class="mx-3">
        <VFlex xs10 class="text-truncate" v-text="assignment.details.title" />
        <VFlex
          v-if="assignment.details"
          xs2
          class="caption grey--text text--darken-2 text-xs-right text-truncate"
          v-text="assignment.details.time"
        />
      </VLayout>
    </template>
    <VDivider class="mt-2" />
  </VLayout>
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

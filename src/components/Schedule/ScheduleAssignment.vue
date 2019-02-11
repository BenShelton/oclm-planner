<template>
  <VHover>
    <div slot-scope="{ hover }">
      <VListTile class="py-2" :class="{ grey: !assignment.details, 'blue lighten-5': assignment.inherit || assignment.stream }">
        <VListTileContent>
          <VListTileTitle>
            <span v-text="assignment.displayName" />
            <span v-if="assignment.inherit" class="primary--text font-weight-bold">
              (English)
            </span>
          </VListTileTitle>
          <VListTileSubTitle v-if="!assignment.details">
            No Assignment Found
          </VListTileSubTitle>
          <template v-else>
            <VListTileSubTitle v-if="assignment.details.stream">
              <VChip small color="primary" class="white--text">
                Streaming
              </VChip>
            </VListTileSubTitle>
            <VListTileSubTitle v-else>
              <ScheduleAssignee :assignee="assignment.details.assignee" />
              <ScheduleAssignee v-if="hasAssistant" assistant :assignee="assignment.details.assistant" />
            </VListTileSubTitle>
            <VListTileSubTitle v-text="assignment.details.title" />
          </template>
        </VListTileContent>
        <VListTileAction>
          <VListTileActionText v-if="assignment.details" v-text="assignment.details.time" />
          <VBtn v-show="hover" icon @click="onEdit">
            <VIcon>edit</VIcon>
          </VBtn>
        </VListTileAction>
      </VListTile>
      <VDivider />
    </div>
  </VHover>
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

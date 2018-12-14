<template>
  <VHover>
    <div slot-scope="{ hover }">
      <VListTile class="py-2" :class="{ grey: !assignment.details }">
        <VListTileContent>
          <VListTileTitle v-text="assignment.displayName" />
          <VListTileSubTitle v-if="!assignment.details">
            No Assignment Found
          </VListTileSubTitle>
          <template v-else>
            <VListTileSubTitle>
              <ScheduleAssignee :assignee="assignment.details.assignee" />
              <ScheduleAssignee v-if="hasAssistant" :assignee="assignment.details.assistant" />
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

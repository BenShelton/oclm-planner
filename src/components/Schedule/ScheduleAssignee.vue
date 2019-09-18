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

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { congregationModule, scheduleModule } from '@/store'

const DELETED = 'DELETED'

@Component
export default class ScheduleAssignee extends Vue {
  // Props
  @Prop({ type: String, default: '' }) readonly assignee!: string
  @Prop(Boolean) readonly assistant!: boolean

  // Computed
  get loading (): boolean {
    return congregationModule.loading
  }

  get idMap (): typeof congregationModule.idMap {
    return congregationModule.idMap
  }

  get assigneeName (): string {
    if (!this.assignee) return this.assistant ? 'Assistant Required' : 'Assignee Required'
    if (this.loading) return 'Loading...'
    const mappedMember = this.idMap[this.assignee]
    if (!mappedMember) return DELETED
    return mappedMember.name
  }

  get isSelected (): boolean {
    return scheduleModule.selectedAssignee === this.assignee
  }

  get color (): string {
    if (!this.assignee || this.assigneeName === DELETED) return 'error'
    if (this.isSelected) return 'success'
    return ''
  }

  // Methods
  onClick (): void {
    const { assignee, isSelected } = this
    scheduleModule.UPDATE_SELECTED_ASSIGNEE(isSelected ? '' : assignee)
  }
}
</script>

<template>
  <v-layout align-center>
    <v-select
      clearable
      item-text="name"
      item-value="_id"
      no-data-text="No Assignees Available"
      :label="label"
      :loading="loading"
      :disabled="inputDisabled"
      :items="items"
      :value="value"
      @input="onInput"
    />
    <v-tooltip top>
      <v-btn
        slot="activator"
        icon
        small
        outline
        color="primary"
        :disabled="inputDisabled"
        @click="onToggleLanguage"
      >
        <v-icon small v-text="restrictLanguage ? 'person' : 'group'" />
      </v-btn>
      <span v-text="restrictLanguage ? 'Only include this language group' : 'Include all language groups'" />
    </v-tooltip>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

import { congregationModule, scheduleModule } from '@/store'
import { PRIVILEGES } from '@/constants'
import { ICongregationMember, Privileges } from 'types'

@Component
export default class AssigneeSelect extends Vue {
  // Props
  @Prop({ type: String, default: '' }) readonly value!: string
  @Prop({ type: String, required: true }) readonly label!: string
  @Prop({ type: String, default: '' }) readonly type!: Privileges | ''
  @Prop({ type: Boolean, required: true }) readonly disabled!: boolean

  // Data
  restrictLanguage: boolean = true

  // Computed
  get loading (): boolean {
    return congregationModule.loading
  }

  get inputDisabled (): boolean {
    const { type, disabled } = this
    return disabled || !(PRIVILEGES.some(p => p.key === type))
  }

  get privilegedMembers (): ICongregationMember[] {
    const { inputDisabled, type, restrictLanguage } = this
    if (inputDisabled || !type) return []
    return congregationModule.activeMembers.filter(({ privileges, languageGroup }) => {
      if (restrictLanguage && languageGroup !== scheduleModule.language) return false
      return privileges[type]
    })
  }

  get lastAssignmentMap (): { [key: string]: string } {
    const { privilegedMembers, type } = this
    return privilegedMembers.reduce((acc: { [key: string]: string }, m) => {
      const assignments = m.assignments || []
      const lastAssignment = assignments
        .reduce((acc: string[], a) => a.type === type ? acc.concat(a.date) : acc, [])
        .sort((a, b) => a === b ? 0 : a > b ? 1 : -1)
        .pop()
      return Object.assign(acc, { [m._id]: lastAssignment })
    }, {})
  }

  get items (): ICongregationMember[] {
    const { privilegedMembers, lastAssignmentMap } = this
    return privilegedMembers.sort((a, b) => {
      const aDate = lastAssignmentMap[a._id] || ''
      const bDate = lastAssignmentMap[b._id] || ''
      if (aDate === bDate) return 0
      return aDate > bDate ? 1 : -1
    })
  }

  // Methods
  onToggleLanguage (): void {
    this.restrictLanguage = !this.restrictLanguage
    const { privilegedMembers, value } = this
    if (privilegedMembers.every(({ _id }) => _id !== value)) this.onInput(null)
  }

  @Emit('input')
  onInput (val: string | null) {
    return val
  }
}
</script>

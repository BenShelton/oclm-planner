<template>
  <v-layout align-center>
    <v-flex>
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
    </v-flex>
    <v-flex v-if="multiLanguage" xs1>
      <v-tooltip top>
        <v-btn
          slot="activator"
          class="ma-0"
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
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

import { congregationModule, scheduleModule } from '@/store'
import { PRIVILEGES, USED_LANGUAGES } from '@/constants'
import { ICongregationMember, Privileges } from 'types'

export default Vue.extend({
  name: 'AssigneeSelect',

  props: {
    value: { type: String, default: '' },
    label: { type: String, required: true },
    type: { type: String as PropType<Privileges>, default: '' as Privileges },
    school: { type: Number, required: true },
    disabled: { type: Boolean, required: true }
  },

  data: () => ({
    restrictLanguage: true
  }),

  computed: {
    loading (): boolean {
      return congregationModule.loading
    },
    inputDisabled (): boolean {
      const { type, disabled } = this
      return disabled || !(PRIVILEGES.some(p => p.key === type))
    },
    privilegedMembers (): ICongregationMember[] {
      const { inputDisabled, type, restrictLanguage } = this
      if (inputDisabled || !type) return []
      return congregationModule.activeMembers.filter(({ privileges, languageGroup, school }) => {
        if (restrictLanguage && languageGroup !== scheduleModule.language) return false
        if (school && school !== this.school) return false
        return privileges[type]
      })
    },
    lastAssignmentMap (): { [key: string]: string } {
      const { privilegedMembers, type } = this
      return privilegedMembers.reduce((acc: { [key: string]: string }, m) => {
        const assignments = m.assignments || []
        const lastAssignment = assignments
          .reduce((acc: string[], a) => a.type === type ? acc.concat(a.date) : acc, [])
          .sort((a, b) => a === b ? 0 : a > b ? 1 : -1)
          .pop()
        return Object.assign(acc, { [m._id]: lastAssignment })
      }, {})
    },
    items (): ICongregationMember[] {
      const { privilegedMembers, lastAssignmentMap } = this
      return privilegedMembers.sort((a, b) => {
        const aDate = lastAssignmentMap[a._id] || ''
        const bDate = lastAssignmentMap[b._id] || ''
        if (aDate === bDate) return 0
        return aDate > bDate ? 1 : -1
      })
    },
    multiLanguage (): boolean {
      return USED_LANGUAGES.length > 1
    }
  },

  methods: {
    onToggleLanguage (): void {
      this.restrictLanguage = !this.restrictLanguage
      const { privilegedMembers, value } = this
      if (privilegedMembers.every(({ _id }) => _id !== value)) this.onInput(null)
    },
    onInput (val: string | null): void {
      this.$emit('input', val)
    }
  }
})
</script>

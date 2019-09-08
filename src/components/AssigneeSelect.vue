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

<script>
import { mapGetters } from 'vuex'

import { PRIVILEGES } from '@/constants'

export default {
  name: 'AssigneeSelect',

  props: {
    value: { type: String, default: '' },
    label: { type: String, required: true },
    type: { type: String, default: '' },
    disabled: { type: Boolean, required: true }
  },

  data () {
    return {
      restrictLanguage: true
    }
  },

  computed: {
    ...mapGetters({
      activeMembers: 'congregation/activeMembers',
      loading: 'congregation/loading',
      language: 'schedule/language'
    }),
    inputDisabled () {
      const { type, disabled } = this
      return disabled || !(PRIVILEGES.some(p => p.key === type))
    },
    privilegedMembers () {
      const { inputDisabled, activeMembers, type, language, restrictLanguage } = this
      if (inputDisabled) return []
      return activeMembers.filter(({ privileges, languageGroup }) => {
        if (restrictLanguage && languageGroup !== language) return false
        return privileges[type]
      })
    },
    lastAssignmentMap () {
      const { privilegedMembers, type } = this
      return privilegedMembers.reduce((acc, m) => {
        const assignments = m.assignments || []
        const lastAssignment = assignments
          .reduce((acc, a) => a.type === type ? acc.concat(a.date) : acc, [])
          .sort((a, b) => a === b ? 0 : a > b ? 1 : -1)
          .pop()
        return Object.assign(acc, { [m._id]: lastAssignment })
      }, {})
    },
    items () {
      const { privilegedMembers, lastAssignmentMap } = this
      return privilegedMembers.sort((a, b) => {
        const aDate = lastAssignmentMap[a._id] || ''
        const bDate = lastAssignmentMap[b._id] || ''
        if (aDate === bDate) return 0
        return aDate > bDate ? 1 : -1
      })
    }
  },

  methods: {
    onToggleLanguage () {
      this.restrictLanguage = !this.restrictLanguage
      const { privilegedMembers, value } = this
      if (privilegedMembers.every(({ _id }) => _id !== value)) this.onInput(null)
    },
    onInput (val) {
      this.$emit('input', val)
    }
  }
}
</script>

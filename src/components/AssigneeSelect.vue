<template>
  <VSelect
    item-text="name"
    item-value="_id"
    no-data-text="No Assignees Available"
    :label="label"
    :loading="loading"
    :disabled="disabled"
    :items="items"
    :value="value"
    @input="onInput"
  />
</template>

<script>
import { mapGetters } from 'vuex'

import { PRIVILEGES } from '@/constants'

export default {
  name: 'AssigneeSelect',

  props: {
    value: { type: String, default: '' },
    label: { type: String, required: true },
    type: { type: String, default: '' }
  },

  computed: {
    ...mapGetters({
      activeMembers: 'congregation/activeMembers',
      loading: 'congregation/loading'
    }),
    disabled () {
      const { type } = this
      return !(PRIVILEGES.some(p => p.key === type))
    },
    privilegedMembers () {
      const { disabled, activeMembers, type } = this
      if (disabled) return []
      return activeMembers.filter(m => m.privileges[type])
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
    onInput (val) {
      this.$emit('input', val)
    }
  }
}
</script>

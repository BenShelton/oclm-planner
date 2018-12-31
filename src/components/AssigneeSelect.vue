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
    items () {
      const { disabled, activeMembers, type } = this
      if (disabled) return []
      return activeMembers.filter(m => m.privileges[type])
    }
  },

  methods: {
    onInput (val) {
      this.$emit('input', val)
    }
  }
}
</script>

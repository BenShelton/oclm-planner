<template>
  <VSelect
    item-text="name"
    item-value="_id"
    no-data-text="No Assignees Available"
    :label="label"
    :loading="loading"
    :items="items"
    :value="value"
    @input="onInput"
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AssigneeSelect',

  props: {
    value: { type: String, default: '' },
    label: { type: String, required: true }
  },

  computed: {
    ...mapGetters({
      activeMembers: 'congregation/activeMembers',
      loading: 'congregation/loading'
    }),
    items () {
      return this.activeMembers
    }
  },

  methods: {
    onInput (val) {
      this.$emit('input', val)
    }
  }
}
</script>

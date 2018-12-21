<template>
  <VSelect
    item-text="name"
    item-value="name"
    no-data-text="No Assignees Available"
    :label="label"
    :loading="loading"
    :items="items"
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AssigneeSelect',

  props: {
    value: { type: String, required: true },
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
  }
}
</script>

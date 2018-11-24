<template>
  <v-chip
    class="ml-0 mr-2"
    small
    :color="color"
  >
    {{ assignee || 'Assignee Required' }}
  </v-chip>
</template>

<script>
export default {
  props: {
    assignee: { type: String, default: '' }
  },

  computed: {
    color () {
      return this.assignee ? '' : 'error'
    }
  }
}
</script>

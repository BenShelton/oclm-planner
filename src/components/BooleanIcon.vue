<template>
  <v-icon
    :color="color"
    v-text="icon"
  />
</template>

<script>
export default {
  name: 'BooleanIcon',

  props: {
    value: { type: Boolean }
  },

  computed: {
    color () {
      return this.value ? 'green' : 'red'
    },

    icon () {
      return this.value ? 'check' : 'clear'
    }
  }
}
</script>

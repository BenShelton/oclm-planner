<template>
  <v-icon
    :color="value ? 'green' : 'red'"
    v-text="value ? 'check' : 'clear'"
  />
</template>

<script>
export default {
  name: 'BooleanIcon',

  props: {
    value: { type: Boolean, default: false }
  }
}
</script>

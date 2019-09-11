<template>
  <v-icon
    :color="color"
    v-text="icon"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class BooleanIcon extends Vue {
  @Prop(Boolean) readonly value!: boolean

  get color () {
    return this.value ? 'green' : 'red'
  }

  get icon () {
    return this.value ? 'check' : 'clear'
  }
}
</script>

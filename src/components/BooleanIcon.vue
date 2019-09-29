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
  // Props
  @Prop(Boolean) readonly value!: boolean

  // Computed
  get color (): string {
    return this.value ? 'green' : 'red'
  }

  get icon (): string {
    return this.value ? 'check' : 'clear'
  }
}
</script>

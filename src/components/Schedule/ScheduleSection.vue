<template>
  <div>
    <v-subheader
      class="schedule-section white--text"
      :style="{ backgroundColor }"
      @click="toggleShow"
    >
      <span v-text="title" />
      <v-spacer />
      <v-icon color="white" v-text="show ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
    </v-subheader>
    <v-divider />
    <slot v-if="show" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { COLORS } from '@/constants'
import { Colors } from 'types'

@Component
export default class ScheduleSection extends Vue {
  // Props
  @Prop({ type: String, required: true }) readonly title!: string
  @Prop({ type: String, required: true }) readonly color!: Colors

  // Data
  show: boolean = true

  // Computed
  get backgroundColor (): string {
    return COLORS[this.color]
  }

  // Methods
  toggleShow (): void {
    this.show = !this.show
  }
}
</script>

<style lang="stylus" scoped>
.schedule-section
  cursor pointer
  user-select none
</style>

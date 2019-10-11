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
import Vue, { PropType } from 'vue'

import { COLORS } from '@/constants'
import { Colors } from 'types'

export default Vue.extend({
  name: 'ScheduleSection',

  props: {
    title: { type: String, required: true },
    color: { type: String as PropType<Colors>, required: true }
  },

  data: () => ({
    show: true
  }),

  computed: {
    backgroundColor (): string {
      return COLORS[this.color]
    }
  },

  methods: {
    toggleShow (): void {
      this.show = !this.show
    }
  }
})
</script>

<style lang="stylus" scoped>
.schedule-section
  cursor pointer
  user-select none
</style>

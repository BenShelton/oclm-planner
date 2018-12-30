<template>
  <div>
    <VSubheader
      class="schedule-section white--text"
      :style="{ backgroundColor }"
      @click="toggleShow"
    >
      <span v-text="title" />
      <VSpacer />
      <VIcon color="white" v-text="show ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
    </VSubheader>
    <VDivider />
    <slot v-if="show" />
  </div>
</template>

<script>
import { COLORS } from '@/constants'

export default {
  name: 'ScheduleSection',

  props: {
    title: { type: String, required: true },
    color: { type: String, required: true }
  },

  data () {
    return {
      show: true
    }
  },

  computed: {
    backgroundColor () {
      return COLORS[this.color] || this.color
    }
  },

  methods: {
    toggleShow () {
      this.show = !this.show
    }
  }
}
</script>

<style lang="stylus" scoped>
.schedule-section
  cursor pointer
  user-select none
</style>

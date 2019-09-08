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

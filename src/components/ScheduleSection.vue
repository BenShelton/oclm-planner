<template>
  <div>
    <v-subheader
      class="schedule-section white--text"
      :class="color"
      @click="toggleShow"
    >
      <span v-text="title" />
      <v-spacer />
      <v-icon color="white" v-text="show ? 'keyboard_arrow_down' : 'keyboard_arrow_up'" />
    </v-subheader>
    <v-divider />
    <slot v-if="show" />
  </div>
</template>

<script>
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

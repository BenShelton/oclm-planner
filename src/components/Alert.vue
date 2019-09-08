<template>
  <v-snackbar
    v-model="showAlert"
    :color="color"
    :timeout="6000"
  >
    {{ text }}
    <v-btn
      dark
      flat
      @click="setVisibility(false)"
    >
      Close
    </v-btn>
  </v-snackbar>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Alert',

  computed: {
    ...mapState('alert', [
      'text',
      'color',
      'visible'
    ]),
    showAlert: {
      get () {
        return this.visible
      },
      set (v) {
        this.setVisibility(v)
      }
    }
  },

  methods: {
    ...mapMutations({
      setVisibility: 'alert/UPDATE_VISIBILITY'
    })
  }
}
</script>

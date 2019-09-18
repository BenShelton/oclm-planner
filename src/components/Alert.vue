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

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { alertModule } from '@/store'

@Component
export default class Alert extends Vue {
  // Computed
  get text (): string {
    return alertModule.text
  }

  get color (): string {
    return alertModule.color
  }

  get showAlert (): boolean {
    return alertModule.visible
  }
  set showAlert (v) {
    this.setVisibility(v)
  }

  // Methods
  setVisibility = alertModule.UPDATE_VISIBILITY
}
</script>

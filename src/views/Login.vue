<template>
  <v-layout fill-height align-center justify-center>
    <v-card width="400" class="pa-4">
      <v-card-title class="justify-center">
        <p class="headline text-xs-center">
          Please enter a password to continue
        </p>
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="password"
          solo
          label="Password"
          :type="visible ? 'text' : 'password'"
          :append-icon="visible ? 'visibility_off' : 'visibility'"
          @click:append="toggleVisible"
          @keydown.enter="onLogin"
        />
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="primary"
          :disabled="disabled"
          :loading="loading"
          @click="onLogin"
        >
          Login
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { authModule, alertModule } from '@/store'
import routes from '@/router/routes'

@Component
export default class Login extends Vue {
  // Data
  password: string = ''
  visible: boolean = false
  loading: boolean = false

  // Computed
  get disabled (): boolean {
    return this.loading || !this.password
  }

  // Methods
  toggleVisible (): void {
    this.visible = !this.visible
  }

  onLogin (): void {
    const { password } = this
    if (!password) return
    this.loading = true
    authModule.login({ password })
      .then(() => this.$router.push({ name: routes.HOME }))
      .catch(err => {
        alertModule.UPDATE_ALERT({ text: 'Login was unsuccessful', color: 'error' })
        console.error(err)
      })
      .finally(() => { this.loading = false })
  }
}
</script>

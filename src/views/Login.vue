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

<script>
import { mapActions, mapMutations } from 'vuex'

import routes from '@/router/routes'

export default {
  name: 'Login',

  data () {
    return {
      password: '',
      visible: false,
      loading: false
    }
  },

  computed: {
    disabled () {
      return this.loading || !this.password
    }
  },

  methods: {
    ...mapActions({
      login: 'auth/login'
    }),
    ...mapMutations({
      alert: 'alert/UPDATE_ALERT'
    }),
    toggleVisible () {
      this.visible = !this.visible
    },
    onLogin () {
      const { password } = this
      if (!password) return
      this.loading = true
      this.login({ password })
        .then(() => this.$router.push({ name: routes.HOME }))
        .catch(err => {
          this.alert({ text: 'Login was unsuccessful', color: 'error' })
          console.error(err)
        })
        .finally(() => { this.loading = false })
    }
  }
}
</script>

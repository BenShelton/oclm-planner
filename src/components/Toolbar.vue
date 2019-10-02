<template>
  <v-toolbar app>
    <v-toolbar-side-icon v-if="loggedIn" @click.stop="toggleDrawer" />
    <v-toolbar-title v-text="title" />
    <v-spacer />
    <v-toolbar-items>
      <v-btn
        v-if="showLogin"
        flat
        :disabled="loading"
        :loading="loading"
        @click="onLogin"
      >
        Login
      </v-btn>
      <v-menu
        v-if="loggedIn"
        offset-y
        :close-on-content-click="false"
        :min-width="200"
        :max-width="200"
      >
        <v-btn slot="activator" icon>
          <v-icon>settings</v-icon>
        </v-btn>
        <v-card class="pa-3">
          <v-select
            v-model="languageModel"
            label="Language"
            :items="items"
          />
          <v-btn
            block
            color="error"
            :disabled="loading"
            :loading="loading"
            @click="onLogout"
          >
            Logout
          </v-btn>
        </v-card>
      </v-menu>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue'

import routes from '@/router/routes'
import { authModule, scheduleModule, alertModule, drawerModule } from '@/store'
import { SUPPORTED_LANGUAGES } from '@/constants'
import { Languages } from 'types'

export default Vue.extend({
  name: 'Toolbar',

  data: () => ({
    loading: false,
    items: SUPPORTED_LANGUAGES
  }),

  computed: {
    loggedIn (): boolean {
    return authModule.hasToken
    },
    languageModel: {
      get (): Languages {
    return scheduleModule.language
      },
      set (val: Languages) {
    scheduleModule.UPDATE_LANGUAGE(val)
  }
    },
    title (): string {
    const prefix = this.$vuetify.breakpoint.smAndDown ? '' : 'OCLM Planner | '
    let title = 'Untitled'
    switch (this.$route.name) {
      case routes.HOME: title = 'Home'; break
      case routes.LOGIN: title = 'Login'; break
      case routes.SCHEDULE: title = 'Schedule'; break
      case routes.EXPORT: title = 'Export'; break
      case routes.CONGREGATION: title = 'Congregation'; break
      case routes.HELP: title = 'Help'; break
    }
    return prefix + title
    },
    showLogin (): boolean {
    return !this.loggedIn && this.$route.name !== routes.LOGIN
  }
  },

  methods: {
    toggleDrawer: drawerModule.TOGGLE_OPEN,
  onLogin (): void {
    this.$router.push({ name: routes.LOGIN })
    },
  onLogout (): void {
    this.loading = true
    authModule.logout()
      .then(() => {
        alertModule.UPDATE_ALERT({ text: 'Successfully logged out', color: 'success' })
        this.$router.push({ name: routes.HOME })
      })
      .catch(err => {
        alertModule.UPDATE_ALERT({ text: 'Logout failed', color: 'error' })
        console.error(err)
      })
      .finally(() => {
        this.loading = false
      })
  }
}
})
</script>

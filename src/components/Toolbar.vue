<template>
  <v-toolbar app>
    <v-toolbar-side-icon v-if="loggedIn" @click.stop="toggleDrawer" />
    <v-toolbar-title v-text="title" />
    <v-spacer />
    <v-toolbar-items>
      <v-btn
        v-if="!loggedIn"
        flat
        :disabled="loading"
        :loading="loading"
        @click="onLogin"
      >
        Login
      </v-btn>
      <v-menu
        v-else
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

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import routes from '@/router/routes'
import { SUPPORTED_LANGUAGES } from '@/constants'

export default {
  name: 'Toolbar',

  data () {
    return {
      loading: false,
      items: SUPPORTED_LANGUAGES
    }
  },

  computed: {
    ...mapGetters({
      loggedIn: 'auth/hasToken',
      language: 'schedule/language'
    }),
    languageModel: {
      get () {
        return this.language
      },
      set (val) {
        this.updateLanguage(val)
      }
    },
    title () {
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
    }
  },

  methods: {
    ...mapActions({
      logout: 'auth/logout'
    }),
    ...mapMutations({
      toggleDrawer: 'drawer/TOGGLE_OPEN',
      alert: 'alert/UPDATE_ALERT',
      updateLanguage: 'schedule/UPDATE_LANGUAGE'
    }),
    onLogin () {
      this.$router.push({ name: routes.LOGIN })
    },
    onLogout () {
      this.loading = true
      this.logout()
        .then(() => {
          this.alert({ text: 'Successfully logged out', color: 'success' })
          this.$router.push({ name: routes.HOME })
        })
        .catch(err => {
          this.alert({ text: 'Logout failed', color: 'error' })
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

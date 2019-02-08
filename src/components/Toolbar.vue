<template>
  <VToolbar app>
    <VToolbarSideIcon v-if="loggedIn" @click.stop="toggleDrawer" />
    <VToolbarTitle>
      OCLM Planner | {{ title }}
    </VToolbarTitle>
    <VSpacer />
    <VToolbarItems>
      <VBtn
        v-if="!loggedIn"
        flat
        :disabled="loading"
        :loading="loading"
        @click="onLogin"
      >
        Login
      </VBtn>
      <VMenu
        v-else
        offset-y
        :close-on-content-click="false"
        :min-width="200"
        :max-width="200"
      >
        <VBtn slot="activator" icon>
          <VIcon>settings</VIcon>
        </VBtn>
        <VCard class="pa-3">
          <VSelect
            v-model="languageModel"
            label="Language"
            :items="items"
          />
          <VBtn
            block
            color="error"
            :disabled="loading"
            :loading="loading"
            @click="onLogout"
          >
            Logout
          </VBtn>
        </VCard>
      </VMenu>
    </VToolbarItems>
  </VToolbar>
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
      switch (this.$route.name) {
        case routes.HOME:
          return 'Home'
        case routes.LOGIN:
          return 'Login'
        case routes.SCHEDULE:
          return 'Schedule'
        case routes.EXPORT:
          return 'Export'
        case routes.CONGREGATION:
          return 'Congregation'
        case routes.HELP:
          return 'Help'
        default:
          return 'Untitled'
      }
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

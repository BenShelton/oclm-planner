<template>
  <VToolbar app>
    <VToolbarSideIcon v-if="loggedIn" @click.stop="toggleDrawer" />
    <VToolbarTitle>
      OCLM Planner | {{ title }}
    </VToolbarTitle>
    <VSpacer />
    <VToolbarItems>
      <VBtn
        flat
        :disabled="loading"
        :loading="loading"
        @click="onButtonClick"
      >
        {{ loggedIn ? 'Logout' : 'Login' }}
      </VBtn>
    </VToolbarItems>
  </VToolbar>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import routes from '@/router/routes'

export default {
  name: 'Toolbar',

  data () {
    return {
      loading: false
    }
  },

  computed: {
    ...mapGetters({
      loggedIn: 'auth/hasToken'
    }),
    title () {
      switch (this.$route.name) {
        case routes.HOME:
          return 'Home'
        case routes.LOGIN:
          return 'Login'
        case routes.SCHEDULE:
          return 'Schedule'
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
      alert: 'alert/UPDATE_ALERT'
    }),
    onButtonClick () {
      if (!this.loggedIn) {
        this.$router.push({ name: routes.LOGIN })
        return
      }
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

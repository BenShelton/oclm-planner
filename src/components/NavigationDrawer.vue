<template>
  <v-navigation-drawer v-model="drawer" app temporary>
    <v-toolbar class="pl-0">
      <v-toolbar-side-icon @click="setOpen(false)">
        <v-icon>close</v-icon>
      </v-toolbar-side-icon>
      <v-toolbar-title>OCLM Planner</v-toolbar-title>
    </v-toolbar>
    <v-list>
      <v-list-tile
        v-for="item of items"
        :key="item.title"
        exact
        :to="item.link"
      >
        <v-list-tile-action>
          <v-icon v-text="item.icon" />
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title v-text="item.title" />
        </v-list-tile-content>
        <v-list-tile-action v-if="item.label">
          <v-chip small :color="item.label.color">
            {{ item.label.text }}
          </v-chip>
        </v-list-tile-action>
      </v-list-tile>
      <template v-if="loggedIn">
        <v-divider />
        <v-list-tile @click="onLogout">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Logout</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue'

import { authModule, alertModule, drawerModule } from '@/store'
import routes from '@/router/routes'

interface IDrawerItem {
  title: string
  icon: string
  link: {
    name: string
  }
  label?: {
    text: string
    color: string
  }
}

export default Vue.extend({
  name: 'NavigationDrawer',

  data: () => ({
    loading: false
  }),

  computed: {
    loggedIn (): boolean {
      return authModule.hasToken
    },
    items (): IDrawerItem[] {
      return this.loggedIn
        ? [
          { title: 'Home', icon: 'home', link: { name: routes.HOME }, label: { text: 'Stable', color: 'green' } },
          { title: 'Schedule', icon: 'assignment', link: { name: routes.SCHEDULE }, label: { text: 'Stable', color: 'green' } },
          { title: 'Export', icon: 'picture_as_pdf', link: { name: routes.EXPORT }, label: { text: 'Stable', color: 'green' } },
          { title: 'Congregation', icon: 'people', link: { name: routes.CONGREGATION }, label: { text: 'Stable', color: 'green' } },
          { title: 'Help', icon: 'help', link: { name: routes.HELP }, label: { text: 'Incomplete', color: 'yellow' } }
        ]
        : [
          { title: 'Login', icon: 'person', link: { name: routes.LOGIN } }
        ]
    },
    drawer: {
      get (): boolean {
        return drawerModule.open
      },
      set (val: boolean) {
        this.setOpen(val)
      }
    }
  },

  methods: {
    setOpen (val: boolean): void {
      drawerModule.SET_OPEN(val)
    },
    onLogout (): void {
      this.loading = true
      authModule.logout()
        .then(() => {
          alertModule.UPDATE_ALERT({ text: 'Successfully logged out', color: 'success' })
          if (this.$route.name !== routes.HOME) this.$router.push({ name: routes.HOME })
          this.drawer = false
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

<style lang="stylus" scoped>
.icon
  height 100%
</style>

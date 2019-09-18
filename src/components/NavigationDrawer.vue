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
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { mapState, mapMutations } from 'vuex'

import { drawerModule } from '@/store'
import routes from '@/router/routes'

interface DrawerItem {
  title: string,
  icon: string,
  link: {
    name: string
  },
  label: {
    text: string,
    color: string
  }
}

@Component
export default class NavigationDrawer extends Vue {
  // Data
  items: DrawerItem[] = [
    { title: 'Home', icon: 'home', link: { name: routes.HOME }, label: { text: 'Stable', color: 'green' } },
    { title: 'Schedule', icon: 'assignment', link: { name: routes.SCHEDULE }, label: { text: 'Stable', color: 'green' } },
    { title: 'Export', icon: 'picture_as_pdf', link: { name: routes.EXPORT }, label: { text: 'Stable', color: 'green' } },
    { title: 'Congregation', icon: 'people', link: { name: routes.CONGREGATION }, label: { text: 'Stable', color: 'green' } },
    { title: 'Help', icon: 'help', link: { name: routes.HELP }, label: { text: 'Incomplete', color: 'yellow' } }
  ]

  // Computed
  get drawer (): boolean {
    return drawerModule.open
  }
  set drawer (val) {
    this.setOpen(val)
  }

  // Methods
  setOpen (val: boolean): void {
    drawerModule.SET_OPEN(val)
  }
}
</script>

<style lang="stylus" scoped>
.icon
  height 100%
</style>

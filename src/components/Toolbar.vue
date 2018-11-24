<template>
  <v-toolbar app>
    <v-toolbar-side-icon @click.stop="toggleDrawer" />
    <v-toolbar-title>{{ title }}</v-toolbar-title>
  </v-toolbar>
</template>

<script>
import { mapMutations } from 'vuex'
import routeNames from '@/router/routeNames'

export default {
  name: 'Toolbar',

  computed: {
    title () {
      switch (this.$route.name) {
        case routeNames.HOME:
          return 'Home'
        case routeNames.SCHEDULE:
          return 'Schedule'
        case routeNames.CONGREGATION:
          return 'Congregation'
        case routeNames.HELP:
          return 'Help'
        default:
          return 'OCLM Planner'
      }
    }
  },

  methods: {
    ...mapMutations({
      toggleDrawer: 'drawer/TOGGLE_OPEN'
    })
  }
}
</script>

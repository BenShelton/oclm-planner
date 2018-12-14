<template>
  <VToolbar app>
    <VToolbarSideIcon @click.stop="toggleDrawer" />
    <VToolbarTitle>{{ title }}</VToolbarTitle>
  </VToolbar>
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

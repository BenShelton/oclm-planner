<template>
  <VToolbar app>
    <VToolbarSideIcon @click.stop="toggleDrawer" />
    <VToolbarTitle>{{ title }}</VToolbarTitle>
  </VToolbar>
</template>

<script>
import { mapMutations } from 'vuex'
import routes from '@/router/routes'

export default {
  name: 'Toolbar',

  computed: {
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

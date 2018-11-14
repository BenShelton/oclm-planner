<template>
  <v-toolbar app>
    <v-toolbar-side-icon @click.stop="toggleDrawer" />
    <v-toolbar-title>OCLM Planner</v-toolbar-title>
  </v-toolbar>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'Toolbar',

  methods: {
    ...mapMutations({
      toggleDrawer: 'drawer/TOGGLE_OPEN'
    })
  }
}
</script>

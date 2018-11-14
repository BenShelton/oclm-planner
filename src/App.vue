<template>
  <v-app>
    <NavigationDrawer />
    <Toolbar />
    <v-content>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-content>
    <v-footer app />
  </v-app>
</template>

<script>
import NavigationDrawer from '@/components/NavigationDrawer'
import Toolbar from '@/components/Toolbar'

export default {
  name: 'App',

  components: {
    NavigationDrawer,
    Toolbar
  }
}
</script>

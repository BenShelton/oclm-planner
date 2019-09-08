<template>
  <v-app>
    <NavigationDrawer />
    <Toolbar />
    <v-content>
      <v-container fluid fill-height>
        <router-view />
      </v-container>
      <Alert />
    </v-content>
  </v-app>
</template>

<script>
import NavigationDrawer from '@/components/NavigationDrawer'
import Toolbar from '@/components/Toolbar'
import Alert from '@/components/Alert'

export default {
  name: 'App',

  components: {
    NavigationDrawer,
    Toolbar,
    Alert
  }
}
</script>

<style lang="stylus">
@import './stylus/custom.styl'
</style>

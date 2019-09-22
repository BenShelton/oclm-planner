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

<script lang="ts">
import Vue from 'vue'

import NavigationDrawer from '@/components/NavigationDrawer.vue'
import Toolbar from '@/components/Toolbar.vue'
import Alert from '@/components/Alert.vue'

export default Vue.extend({
  name: 'App',

  components: {
    NavigationDrawer,
    Toolbar,
    Alert
  }
})
</script>

<style lang="stylus">
@import './stylus/custom.styl'
</style>

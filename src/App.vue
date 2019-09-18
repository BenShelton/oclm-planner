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
import { Component, Vue } from 'vue-property-decorator'

import NavigationDrawer from '@/components/NavigationDrawer.vue'
import Toolbar from '@/components/Toolbar.vue'
import Alert from '@/components/Alert.vue'

@Component({
  components: {
    NavigationDrawer,
    Toolbar,
    Alert
  }
})
export default class App extends Vue {}
</script>

<style lang="stylus">
@import './stylus/custom.styl'
</style>

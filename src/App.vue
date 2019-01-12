<template>
  <VApp>
    <NavigationDrawer />
    <Toolbar />
    <VContent>
      <VContainer fluid fill-height>
        <RouterView />
      </VContainer>
      <Alert />
    </VContent>
  </VApp>
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

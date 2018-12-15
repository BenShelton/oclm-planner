<template>
  <VApp>
    <NavigationDrawer />
    <Toolbar />
    <VContent>
      <VContainer fluid fill-height>
        <RouterView />
      </VContainer>
    </VContent>
    <VFooter app />
  </VApp>
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

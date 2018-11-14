<template>
  <v-navigation-drawer v-model="drawer" app temporary />
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'NavigationDrawer',

  computed: {
    ...mapState({
      open: state => state.drawer.open
    }),
    drawer: {
      get () {
        return this.open
      },
      set (val) {
        this.setOpen(val)
      }
    }
  },

  methods: {
    ...mapMutations({
      setOpen: 'drawer/SET_OPEN'
    })
  }
}
</script>

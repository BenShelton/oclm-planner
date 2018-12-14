<template>
  <VNavigationDrawer v-model="drawer" app temporary>
    <VList>
      <VListTile
        v-for="item in items"
        :key="item.title"
        exact
        :to="item.link"
      >
        <VListTileAction>
          <VIcon>{{ item.icon }}</VIcon>
        </VListTileAction>
        <VListTileContent>
          <VListTileTitle>{{ item.title }}</VListTileTitle>
        </VListTileContent>
      </VListTile>
    </VList>
  </VNavigationDrawer>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import routeNames from '@/router/routeNames'

export default {
  name: 'NavigationDrawer',

  data () {
    return {
      items: [
        { title: 'Home', icon: 'home', link: { name: routeNames.HOME } },
        { title: 'Schedule', icon: 'assignment', link: { name: routeNames.SCHEDULE } },
        { title: 'Congregation', icon: 'people', link: { name: routeNames.CONGREGATION } },
        { title: 'Help', icon: 'help', link: { name: routeNames.HELP } }
      ]
    }
  },

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

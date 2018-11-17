<template>
  <v-navigation-drawer v-model="drawer" app temporary>
    <v-list>
      <v-list-tile
        v-for="item in items"
        :key="item.title"
        exact
        :to="item.link"
      >
        <v-list-tile-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
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

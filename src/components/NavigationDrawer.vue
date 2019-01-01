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
          <VIcon v-text="item.icon" />
        </VListTileAction>
        <VListTileContent>
          <VListTileTitle v-text="item.title" />
        </VListTileContent>
        <VListTileAction v-if="item.label">
          <VChip small :color="item.label.color">
            {{ item.label.text }}
          </VChip>
        </VListTileAction>
      </VListTile>
    </VList>
  </VNavigationDrawer>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import routes from '@/router/routes'

export default {
  name: 'NavigationDrawer',

  data () {
    return {
      items: [
        { title: 'Home', icon: 'home', link: { name: routes.HOME }, label: { text: 'Stable', color: 'green' } },
        { title: 'Schedule', icon: 'assignment', link: { name: routes.SCHEDULE }, label: { text: 'Stable', color: 'green' } },
        { title: 'Export', icon: 'picture_as_pdf', link: { name: routes.EXPORT }, label: { text: 'Incomplete', color: 'yellow' } },
        { title: 'Congregation', icon: 'people', link: { name: routes.CONGREGATION }, label: { text: 'Stable', color: 'green' } },
        { title: 'Help', icon: 'help', link: { name: routes.HELP }, label: { text: 'Incomplete', color: 'yellow' } }
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

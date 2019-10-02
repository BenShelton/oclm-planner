<template>
  <v-toolbar app>
    <v-toolbar-side-icon @click.stop="toggleDrawer" />
    <v-toolbar-title v-text="title" />
    <v-spacer />
    <v-toolbar-items>
      <v-select
        v-model="languageModel"
        :items="items"
        :style="{ width: '120px' }"
      />
    </v-toolbar-items>
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue'

import routes from '@/router/routes'
import { scheduleModule, drawerModule } from '@/store'
import { SUPPORTED_LANGUAGES } from '@/constants'
import { Languages } from 'types'

export default Vue.extend({
  name: 'Toolbar',

  data: () => ({
    items: SUPPORTED_LANGUAGES
  }),

  computed: {
    languageModel: {
      get (): Languages {
        return scheduleModule.language
      },
      set (val: Languages) {
        scheduleModule.UPDATE_LANGUAGE(val)
      }
    },
    title (): string {
      const prefix = this.$vuetify.breakpoint.smAndDown ? '' : 'OCLM Planner | '
      let title = 'Untitled'
      switch (this.$route.name) {
        case routes.HOME: title = 'Home'; break
        case routes.LOGIN: title = 'Login'; break
        case routes.SCHEDULE: title = 'Schedule'; break
        case routes.EXPORT: title = 'Export'; break
        case routes.CONGREGATION: title = 'Congregation'; break
        case routes.HELP: title = 'Help'; break
      }
      return prefix + title
    }
  },

  methods: {
    toggleDrawer: drawerModule.TOGGLE_OPEN
  }
})
</script>

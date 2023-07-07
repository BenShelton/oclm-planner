<template>
  <v-toolbar app>
    <v-toolbar-side-icon @click.stop="toggleDrawer" />
    <v-toolbar-title v-text="title" />
    <v-toolbar-title>
      <v-icon color="red" class="pr-2">
        warning
      </v-icon>
      <span class="red--text">This site will shut down August 11 2023</span>
      <v-icon color="red" class="pl-2">
        warning
      </v-icon>
    </v-toolbar-title>
    <v-spacer />
    <v-toolbar-items>
      <v-select
        v-if="items.length > 1"
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
import { USED_LANGUAGES } from '@/constants'
import { Languages } from 'types'

export default Vue.extend({
  name: 'Toolbar',

  created () {
    if (this.items.length < 2) {
      this.languageModel = (this.items[0] && this.items[0].value) || 'en'
    }
  },

  data: () => ({
    items: USED_LANGUAGES
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

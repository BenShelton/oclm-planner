<template>
  <VLayout column fill-height>
    <VDataTable
      class="elevation-1"
      expand
      :headers="headers"
      :rows-per-page-items="rowsPerPageItems"
      :items="members"
      :loading="loading"
    >
      <template slot="items" slot-scope="props">
        <tr @click="expandRow(props)">
          <td v-text="props.item.name" />
          <td v-text="props.item.gender" />
          <td v-text="props.item.appointment" />
          <td v-text="props.item.languageGroup" />
          <td class="text-xs-center">
            <BooleanIcon :value="props.item.show" />
          </td>
          <td class="text-xs-center">
            <VBtn
              flat
              round
              icon
              @click.stop="openEditor(props)"
            >
              <VIcon>edit</VIcon>
            </VBtn>
          </td>
        </tr>
      </template>
      <template slot="expand" slot-scope="props">
        <VLayout row wrap class="grey lighten-5">
          <VLayout
            v-for="privilege in prettyPrivileges(props.item.privileges)"
            :key="privilege.name"
            align-center
            class="pa-3 shrink"
          >
            <span v-text="privilege.name" />
            <BooleanIcon class="px-1" :value="privilege.selected" />
          </VLayout>
        </VLayout>
      </template>
    </VDataTable>
  </VLayout>
</template>

<script>
import { mapGetters } from 'vuex'

import BooleanIcon from '@/components/BooleanIcon'

import { PRIVILEGES } from '@/constants'

export default {
  name: 'Congregation',

  components: { BooleanIcon },

  data () {
    return {
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Gender', value: 'gender' },
        { text: 'Appointment', value: 'appointment' },
        { text: 'Language Group', value: 'languageGroup' },
        { text: 'Show On Schedule', value: 'show', align: 'center' },
        { text: 'Actions', value: '', align: 'center', sortable: false }
      ],
      rowsPerPageItems: [20, 50, 100, { text: 'All', value: -1 }]
    }
  },

  computed: {
    ...mapGetters({
      members: 'congregation/members',
      loading: 'congregation/loading'
    })
  },

  methods: {
    expandRow (props) {
      props.expanded = !props.expanded
    },
    openEditor (props) {
      console.log('Open Editor?')
    },
    prettyPrivileges (privileges) {
      if (!privileges) return []
      return PRIVILEGES.map(({ name, key }) => ({ name, selected: !!privileges[key] }))
    }
  }
}
</script>

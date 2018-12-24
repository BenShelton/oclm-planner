<template>
  <VLayout column fill-height>
    <VLayout class="mb-3">
      <VSpacer />
      <VDialog v-model="editDialog" max-width="900px">
        <VBtn slot="activator" color="primary">
          Add New Member
        </VBtn>
        <VCard>
          <VCardTitle>
            <span class="headline" v-text="editTitle" />
          </VCardTitle>

          <VCardText>
            <VContainer grid-list-lg>
              <VLayout wrap>
                <VFlex xs12 sm6 md4>
                  <VTextField v-model="editMember.name" label="Name" />
                </VFlex>
                <VFlex xs12 sm6 md4>
                  <VTextField v-model="editMember.gender" label="Gender" />
                </VFlex>
                <VFlex xs12 sm6 md4>
                  <VTextField v-model="editMember.appointment" label="Appointment" />
                </VFlex>
                <VFlex xs12 sm6 md4>
                  <VTextField v-model="editMember.languageGroup" label="Language Group" />
                </VFlex>
                <VFlex xs12 sm6 md4>
                  <VCheckbox v-model="editMember.show" label="Show On Schedule" />
                </VFlex>
              </VLayout>
            </VContainer>
          </VCardText>

          <VCardActions>
            <VSpacer />
            <VBtn color="blue darken-1" flat @click="onCancel">
              Cancel
            </VBtn>
            <VBtn color="blue darken-1" flat @click="onSave">
              Save
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    </VLayout>

    <VDataTable
      class="elevation-1"
      expand
      item-key="_id"
      no-data-text="No Members Found"
      :headers="headers"
      :rows-per-page-items="rowsPerPageItems"
      :items="members"
      :loading="loading"
    >
      <template slot="items" slot-scope="props">
        <tr class="pointer" @click="expandRow(props)">
          <td v-text="props.item.name" />
          <td v-text="props.item.abbreviation" />
          <td v-text="props.item.gender" />
          <td v-text="props.item.appointment" />
          <td v-text="props.item.languageGroup" />
          <td class="text-xs-center">
            <BooleanIcon :value="props.item.show" />
          </td>
          <td class="text-xs-center">
            <VIcon v-text="props.expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
          </td>
          <td class="text-xs-center">
            <VBtn
              flat
              round
              icon
              @click.stop="onEdit(props)"
            >
              <VIcon>edit</VIcon>
            </VBtn>
            <VBtn
              flat
              round
              icon
              @click.stop="onDelete(props)"
            >
              <VIcon>delete</VIcon>
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
        <VDivider />
      </template>
    </VDataTable>
  </VLayout>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import BooleanIcon from '@/components/BooleanIcon'

import { PRIVILEGES } from '@/constants'

export default {
  name: 'Congregation',

  components: { BooleanIcon },

  data () {
    return {
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Abbreviation', value: 'abbreviation' },
        { text: 'Gender', value: 'gender' },
        { text: 'Appointment', value: 'appointment' },
        { text: 'Language Group', value: 'languageGroup' },
        { text: 'Show On Schedule', value: 'show', align: 'center' },
        { text: 'Privileges', value: '', align: 'center', sortable: false },
        { text: 'Actions', value: '', align: 'center', sortable: false }
      ],
      rowsPerPageItems: [20, 50, 100, { text: 'All', value: -1 }],
      editDialog: false,
      editTitle: 'Add New Congregation Member',
      editMember: {
        name: '',
        gender: 'Male',
        appointment: '',
        languageGroup: 'English',
        show: true,
        privileges: {}
      }
    }
  },

  computed: {
    ...mapGetters({
      members: 'congregation/members',
      loading: 'congregation/loading'
    })
  },

  methods: {
    ...mapMutations({
      alert: 'alert/UPDATE_ALERT'
    }),
    expandRow (props) {
      props.expanded = !props.expanded
    },
    onEdit (props) {
      this.alert({ text: 'Editing members is not currently available', color: 'error' })
    },
    onDelete (props) {
      this.alert({ text: 'Deleting members is not currently available', color: 'error' })
    },
    onCancel () {
      this.editDialog = false
    },
    onSave () {
      this.alert({ text: 'Adding members is not currently available', color: 'error' })
    },
    prettyPrivileges (privileges) {
      if (!privileges) return []
      return PRIVILEGES.map(({ name, key }) => ({ name, selected: !!privileges[key] }))
    }
  }
}
</script>

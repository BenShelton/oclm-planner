<template>
  <VLayout column fill-height>
    <VLayout shrink class="mb-4">
      <VFlex xs6 md4>
        <VTextField
          v-model="search"
          single-line
          hide-details
          clearable
          prepend-icon="search"
          label="Search"
        />
      </VFlex>
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
                  <VTextField v-model="editMember.name" required label="Name" />
                </VFlex>
                <VFlex xs12 sm6 md4>
                  <VTextField v-model="editMember.abbreviation" required label="Abbreviation" />
                </VFlex>
                <VFlex xs12 sm6 md4>
                  <VSelect v-model="editMember.gender" label="Gender" :items="GENDERS" />
                </VFlex>
                <VFlex xs12 sm6 md4>
                  <VSelect v-model="editMember.appointment" label="Appointment" :items="APPOINTMENTS" />
                </VFlex>
                <VFlex xs12 sm6 md4>
                  <VSelect v-model="editMember.languageGroup" label="Language Group" :items="LANGUAGE_GROUPS" />
                </VFlex>
                <VFlex xs12 sm6 md4>
                  <VCheckbox v-model="editMember.show" label="Show On Schedule" />
                </VFlex>
              </VLayout>
              <VDivider />
              <p class="mt-3 mb-0 subheading">
                Privileges
              </p>
              <VLayout wrap>
                <VFlex
                  v-for="privilege in PRIVILEGES"
                  :key="privilege.key"
                  xs12
                  sm6
                  md4
                >
                  <VCheckbox
                    v-model="editMember.privileges[privilege.key]"
                    hide-details
                    :label="privilege.name"
                  />
                </VFlex>
              </VLayout>
            </VContainer>
          </VCardText>

          <VCardActions>
            <VSpacer />
            <VBtn color="blue darken-1" flat @click="closeEditor">
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
      :search="search"
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
import { mapGetters, mapActions, mapMutations } from 'vuex'

import BooleanIcon from '@/components/BooleanIcon'

import {
  GENDERS,
  APPOINTMENTS,
  LANGUAGE_GROUPS,
  PRIVILEGES
} from '@/constants'

export default {
  name: 'Congregation',

  components: { BooleanIcon },

  data () {
    return {
      GENDERS,
      APPOINTMENTS,
      LANGUAGE_GROUPS,
      PRIVILEGES,
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
      search: '',
      editDialog: false,
      editTitle: 'Add New Congregation Member',
      editMember: {
        name: '',
        abbreviation: '',
        gender: GENDERS[0],
        appointment: APPOINTMENTS[0],
        languageGroup: LANGUAGE_GROUPS[0],
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
    ...mapActions({
      addMember: 'congregation/add'
    }),
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
    closeEditor () {
      this.editDialog = false
      Object.assign(this.editMember, {
        name: '',
        abbreviation: '',
        gender: GENDERS[0],
        appointment: APPOINTMENTS[0],
        languageGroup: LANGUAGE_GROUPS[0],
        show: true,
        privileges: {}
      })
    },
    onSave () {
      if (!this.editMember.name || !this.editMember.abbreviation) {
        this.alert({ text: 'Name and Abbreviation are required', color: 'error' })
        return
      }
      this.addMember(this.editMember)
        .then(() => {
          this.alert({ text: `${this.editMember.name} was successfully added`, color: 'success' })
          this.closeEditor()
        })
        .catch(err => {
          this.alert({ text: 'An error occured when adding this member', color: 'error' })
          console.error(err)
        })
    },
    prettyPrivileges (privileges) {
      if (!privileges) return []
      return PRIVILEGES.map(({ name, key }) => ({ name, selected: !!privileges[key] }))
    }
  }
}
</script>

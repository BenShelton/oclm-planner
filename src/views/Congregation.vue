<template>
  <v-layout column fill-height>
    <v-layout shrink class="mb-4">
      <v-flex xs6 md4>
        <v-text-field
          v-model="search"
          single-line
          hide-details
          clearable
          prepend-icon="search"
          label="Search"
        />
      </v-flex>
      <v-spacer />
      <v-btn color="primary" @click="onAdd">
        Add New Member
      </v-btn>
      <v-dialog v-model="editDialog" max-width="900px">
        <v-card>
          <v-card-title>
            <span class="headline" v-text="editTitle" />
          </v-card-title>

          <v-card-text>
            <v-container grid-list-lg>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editMember.name" required label="Name" />
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-select v-model="editMember.gender" label="Gender" :items="GENDERS" />
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-select v-model="editMember.appointment" label="Appointment" :items="APPOINTMENTS" />
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-select v-model="editMember.languageGroup" label="Language Group" :items="SUPPORTED_LANGUAGES" />
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-checkbox v-model="editMember.show" label="Show On Schedule" />
                </v-flex>
              </v-layout>
              <v-divider />
              <p class="mt-3 mb-0 subheading">
                Privileges
              </p>
              <v-layout wrap>
                <v-flex
                  v-for="privilege in PRIVILEGES"
                  :key="privilege.key"
                  xs12
                  sm6
                  md4
                >
                  <v-checkbox
                    v-model="editMember.privileges[privilege.key]"
                    hide-details
                    :label="privilege.name"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" flat @click="closeEditor">
              Cancel
            </v-btn>
            <v-btn color="blue darken-1" flat @click="onSave">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

    <v-data-table
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
          <td v-text="props.item.gender" />
          <td v-text="props.item.appointment" />
          <td v-text="languageGroups[props.item.languageGroup]" />
          <td class="text-xs-center">
            <BooleanIcon :value="props.item.show" />
          </td>
          <td class="text-xs-center">
            <v-icon v-text="props.expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
          </td>
          <td class="text-xs-center">
            <v-btn
              flat
              round
              icon
              @click.stop="onEdit(props.item)"
            >
              <v-icon>edit</v-icon>
            </v-btn>
            <v-btn
              flat
              round
              icon
              @click.stop="onDelete(props.item)"
            >
              <v-icon>delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
      <template slot="expand" slot-scope="props">
        <v-layout row wrap class="grey lighten-5">
          <v-layout
            v-for="privilege of prettyPrivileges(props.item.privileges)"
            :key="privilege.name"
            align-center
            class="pa-3 shrink"
          >
            <span v-text="privilege.name" />
            <BooleanIcon class="px-1" :value="privilege.selected" />
          </v-layout>
        </v-layout>
        <v-divider />
      </template>
    </v-data-table>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { alertModule, congregationModule } from '@/store'
import BooleanIcon from '@/components/BooleanIcon.vue'

import {
  GENDERS,
  APPOINTMENTS,
  SUPPORTED_LANGUAGES,
  PRIVILEGES
} from '@/constants'
import { ICongregationMember } from '@/ts/interfaces'

@Component({
  components: {
    BooleanIcon
  }
})
export default class Schedule extends Vue {
  // Data
  GENDERS = GENDERS
  APPOINTMENTS = APPOINTMENTS
  SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES
  PRIVILEGES = PRIVILEGES
  languageGroups = SUPPORTED_LANGUAGES.reduce((acc, { text, value }) => Object.assign(acc, { [value]: text }), {})
  headers = [
    { text: 'Name', value: 'name' },
    { text: 'Gender', value: 'gender' },
    { text: 'Appointment', value: 'appointment' },
    { text: 'Language Group', value: 'languageGroup' },
    { text: 'Show On Schedule', value: 'show', align: 'center' },
    { text: 'Privileges', value: '', align: 'center', sortable: false },
    { text: 'Actions', value: '', align: 'center', sortable: false }
  ]
  rowsPerPageItems = [20, 50, 100, { text: 'All', value: -1 }]
  search: string = ''
  editDialog: boolean = false
  editID: string | null = null
  editTitle: string = ''
  editMember: ICongregationMember = {
    _id: '',
    name: '',
    gender: GENDERS[0],
    appointment: APPOINTMENTS[0],
    languageGroup: SUPPORTED_LANGUAGES[0].value,
    show: true,
    privileges: {}
  }

  // Computed
  get members (): ICongregationMember[] {
    return congregationModule.members
  }

  get loading (): boolean {
    return congregationModule.loading
  }

  // Methods
  expandRow (props: { expanded: boolean }): void {
    props.expanded = !props.expanded
  }

  closeEditor (): void {
    this.editDialog = false
  }

  prettyPrivileges (privileges: ICongregationMember['privileges']): { name: string, selected: boolean}[] {
    if (!privileges) return []
    return PRIVILEGES.map(({ name, key }) => ({ name, selected: !!privileges[key] }))
  }

  onAdd (): void {
    this.editID = null
    Object.assign(this.editMember, {
      name: '',
      gender: GENDERS[0],
      appointment: APPOINTMENTS[0],
      languageGroup: SUPPORTED_LANGUAGES[0].value,
      show: true,
      privileges: {}
    })
    this.editTitle = 'Add New Congregation Member'
    this.editDialog = true
  }

  onEdit (member: ICongregationMember): void {
    this.editID = member._id
    const { name, gender, appointment, languageGroup, show, privileges } = member
    Object.assign(this.editMember, {
      name,
      gender,
      appointment,
      languageGroup,
      show,
      privileges: { ...privileges }
    })
    this.editTitle = 'Edit Existing Congregation Member'
    this.editDialog = true
  }

  onDelete ({ _id: memberID, name }: ICongregationMember): void {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return
    congregationModule.delete({ memberID })
      .then(() => {
        alertModule.UPDATE_ALERT({ text: `${name} was successfully deleted`, color: 'success' })
        this.closeEditor()
      })
      .catch(err => {
        alertModule.UPDATE_ALERT({ text: 'An error occured whilst deleting this member', color: 'error' })
        console.error(err)
      })
  }

  onSave (): void {
    if (!this.editMember.name) {
      alertModule.UPDATE_ALERT({ text: 'Name is required', color: 'error' })
      return
    }
    if (this.editID) {
      congregationModule.update({ memberID: this.editID, member: this.editMember })
        .then(() => {
          alertModule.UPDATE_ALERT({ text: `${this.editMember.name} was successfully updated`, color: 'success' })
          this.closeEditor()
        })
        .catch((err: Error) => {
          alertModule.UPDATE_ALERT({ text: 'An error occured whilst updating this member', color: 'error' })
          console.error(err)
        })
    } else {
      congregationModule.add(this.editMember)
        .then(() => {
          alertModule.UPDATE_ALERT({ text: `${this.editMember.name} was successfully added`, color: 'success' })
          this.closeEditor()
        })
        .catch((err: Error) => {
          alertModule.UPDATE_ALERT({ text: 'An error occured whilst adding this member', color: 'error' })
          console.error(err)
        })
    }
  }
}
</script>

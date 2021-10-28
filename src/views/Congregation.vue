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
      <v-dialog
        v-model="editDialog"
        max-width="900px"
        persistent
        scrollable
      >
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
                  <v-select v-model="editMember.languageGroup" label="Language Group" :items="USED_LANGUAGES" />
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-select v-model="editMember.school" label="Preferred School" :items="preferredSchools" />
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-checkbox v-model="editMember.show" label="Show On Schedule" />
                </v-flex>
              </v-layout>
              <v-divider />
              <p class="mt-3 mb-0 subheading">
                Privileges
              </p>
              <v-layout align-center class="mt-1 ml-1 grey--text text--darken-1">
                <span class="font-weight-bold mr-1">TIP:</span>
                <span>Hover over</span>
                <v-icon size="19" class="mx-1">
                  help
                </v-icon>
                <span>to see more details of an assignment</span>
              </v-layout>
              <v-layout wrap>
                <v-flex
                  v-for="privilege of visiblePrivileges"
                  :key="privilege.key"
                  xs12
                  sm6
                  md4
                >
                  <v-checkbox
                    v-model="editMember.privileges[privilege.key]"
                    hide-details
                    :label="privilege.name"
                    class="mt-0"
                  >
                    <div slot="label">
                      <span v-text="privilege.name" />
                      <v-tooltip v-if="privilege.tip" top>
                        <template #activator="{ on }">
                          <v-icon
                            class="ml-1"
                            size="19"
                            v-on="on"
                          >
                            help
                          </v-icon>
                        </template>
                        <span v-text="privilege.tip" />
                      </v-tooltip>
                    </div>
                  </v-checkbox>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-divider />
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
import Vue from 'vue'

import { alertModule, congregationModule } from '@/store'
import BooleanIcon from '@/components/BooleanIcon.vue'

import {
  GENDERS,
  APPOINTMENTS,
  SUPPORTED_LANGUAGES,
  USED_LANGUAGES,
  PRIVILEGES,
  SECOND_SCHOOL
} from '@/constants'
import { ICongregationMember, Languages } from 'types'

export default Vue.extend({
  name: 'Congregation',

  components: {
    BooleanIcon
  },

  data: () => ({
    search: '',
    editDialog: false,
    editID: null as string | null,
    editTitle: '',
    editMember: {
      _id: '',
      name: '',
      gender: GENDERS[0],
      appointment: APPOINTMENTS[0],
      languageGroup: USED_LANGUAGES[0].value,
      school: null,
      show: true,
      privileges: {}
    } as unknown as ICongregationMember
  }),

  computed: {
    members (): ICongregationMember[] {
      return congregationModule.members
    },
    loading (): boolean {
      return congregationModule.loading
    },
    GENDERS (): typeof GENDERS {
      return GENDERS
    },
    APPOINTMENTS (): typeof APPOINTMENTS {
      return APPOINTMENTS
    },
    USED_LANGUAGES (): typeof USED_LANGUAGES {
      return USED_LANGUAGES
    },
    PRIVILEGES (): typeof PRIVILEGES {
      return PRIVILEGES
    },
    visiblePrivileges (): (typeof PRIVILEGES[number])[] {
      return this.PRIVILEGES.filter(p => p.key !== 'ministryVideo')
    },
    languageGroups (): { [key in Languages]: string } {
      return SUPPORTED_LANGUAGES.reduce((acc, { text, value }) => Object.assign(acc, { [value]: text }), {}) as { [key in Languages]: string }
    },
    preferredSchools (): { text: string, value: null | number }[] {
      const items: { text: string, value: null | number }[] = [{ text: 'Any', value: null }]
      if (SECOND_SCHOOL) items.push({ text: 'First Only', value: 1 }, { text: 'Second Only', value: 2 })
      return items
    },
    headers (): { text: string, value: string, align?: string, sortable?: boolean }[] {
      return [
        { text: 'Name', value: 'name' },
        { text: 'Gender', value: 'gender' },
        { text: 'Appointment', value: 'appointment' },
        { text: 'Language Group', value: 'languageGroup' },
        { text: 'Show On Schedule', value: 'show', align: 'center' },
        { text: 'Privileges', value: '', align: 'center', sortable: false },
        { text: 'Actions', value: '', align: 'center', sortable: false }
      ]
    },
    rowsPerPageItems (): (number | { text: string, value: number })[] {
      return [20, 50, 100, { text: 'All', value: -1 }]
    }
  },

  methods: {
    expandRow (props: { expanded: boolean }): void {
      props.expanded = !props.expanded
    },
    closeEditor (): void {
      this.editDialog = false
    },
    prettyPrivileges (privileges: ICongregationMember['privileges']): { name: string, selected: boolean }[] {
      if (!privileges) return []
      return PRIVILEGES.map(({ name, key }) => ({ name, selected: !!privileges[key] }))
    },
    onAdd (): void {
      this.editID = null
      const baseProperties: Partial<ICongregationMember> = {
        name: '',
        gender: GENDERS[0],
        appointment: APPOINTMENTS[0],
        languageGroup: USED_LANGUAGES[0].value,
        school: null,
        show: true,
        privileges: {}
      }
      Object.assign(this.editMember, baseProperties)
      this.editTitle = 'Add New Congregation Member'
      this.editDialog = true
    },
    onEdit (member: ICongregationMember): void {
      this.editID = member._id
      const { name, gender, appointment, languageGroup, school = null, show, privileges } = member
      const updateProperties: Partial<ICongregationMember> = {
        name,
        gender,
        appointment,
        languageGroup,
        school,
        show,
        privileges: { ...privileges }
      }
      Object.assign(this.editMember, updateProperties)
      this.editTitle = 'Edit Existing Congregation Member'
      this.editDialog = true
    },
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
    },
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
})
</script>

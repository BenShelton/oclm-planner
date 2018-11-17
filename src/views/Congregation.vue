<template>
  <v-layout column fill-height>
    <v-data-table
      class="elevation-1"
      expand
      :headers="headers"
      :rows-per-page-items="rowsPerPageItems"
      :items="items"
    >
      <template slot="items" slot-scope="props">
        <tr @click="expandRow(props)">
          <td v-text="props.item.name" />
          <td v-text="props.item.gender" />
          <td v-text="props.item.appointment" />
          <td v-text="props.item.languageGroup" />
          <td class="text-xs-center">
            <v-icon
              :color="props.item.show ? 'green' : 'red'"
              v-text="props.item.show ? 'check' : 'clear'"
            />
          </td>
          <td class="text-xs-center">
            <v-btn
              flat
              round
              icon
              @click.stop="openEditor(props)"
            >
              <v-icon>edit</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
      <template slot="expand" slot-scope="props">
        <v-layout row wrap class="grey lighten-5">
          <v-layout
            v-for="privilege in prettyPrivileges(props.item.privileges)"
            :key="privilege.name"
            align-center
            class="pa-3 shrink"
          >
            <span v-text="privilege.name" />
            <v-icon
              class="px-1"
              :color="privilege.selected ? 'green' : 'red'"
              v-text="privilege.selected ? 'check' : 'clear'"
            />
          </v-layout>
        </v-layout>
      </template>
    </v-data-table>
  </v-layout>
</template>

<script>
const PRIVILEGES = [
  { name: 'Chairman', key: 'chairman' },
  { name: 'Talk', key: 'talk' },
  { name: 'Gems', key: 'gems' },
  { name: 'Items', key: 'items' },
  { name: 'Book Study', key: 'bookStudy' },
  { name: 'Reader', key: 'reader' },
  { name: 'Prayer', key: 'prayer' },
  { name: 'Initial Call', key: 'initialCall' },
  { name: 'Initial Call Assistant', key: 'initialCallAssist' },
  { name: 'Return Visit', key: 'returnVisit' },
  { name: 'Return Visit Assistant', key: 'returnVisitAssist' },
  { name: 'Bible Study', key: 'bibleStudy' },
  { name: 'Bible Study Assistant', key: 'bibleStudyAssist' },
  { name: 'Student Talk', key: 'studentTalk' }
]

export default {
  name: 'Congregation',

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
      rowsPerPageItems: [20, 50, 100, { text: 'All', value: -1 }],
      items: [
        {
          id: 0,
          name: 'John Smith',
          abbreviation: 'J. Smith',
          appointment: 'Elder',
          gender: 'Male',
          show: true,
          privileges: {
            chairman: true,
            talk: true,
            gems: true,
            items: true,
            bookStudy: true,
            reader: true,
            prayer: true,
            initialCall: true,
            initialCallAssist: true,
            returnVisit: true,
            returnVisitAssist: true,
            bibleStudy: true,
            bibleStudyAssist: true,
            studentTalk: true
          }
        },
        {
          id: 1,
          name: 'Ben Jones',
          abbreviation: 'B. Jones',
          gender: 'Male',
          show: true,
          privileges: {}
        },
        {
          id: 2,
          name: 'Portuguese Sister',
          abbreviation: 'P. Sister',
          gender: 'Female',
          languageGroup: 'Portuguese',
          show: true,
          privileges: {}
        }
      ]
    }
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

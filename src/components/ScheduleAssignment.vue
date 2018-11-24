<template>
  <v-list-tile class="py-2">
    <v-list-tile-content>
      <v-list-tile-title v-text="assignment.name" />
      <v-list-tile-sub-title v-text="assignment.assignee" />
      <v-list-tile-sub-title v-text="assignment.title" />
    </v-list-tile-content>
    <v-list-tile-action>
      <v-list-tile-action-text v-text="assignment.time" />
      <v-btn icon @click="onEdit">
        <v-icon>edit</v-icon>
      </v-btn>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
export default {
  name: 'ScheduleAssignment',

  props: {
    assignment: { type: Object, required: true }
  },

  methods: {
    onEdit () {
      this.$emit('edit')
    }
  }
}
</script>

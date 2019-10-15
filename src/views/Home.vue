<template>
  <v-layout column fill-height>
    <h1 class="mb-3">
      Welcome to OCLM Planner
    </h1>
    <h2>Getting Started</h2>
    <p class="mt-1 mb-4">
      Click the navigation menu on the top left to login and navigate the site
    </p>
    <h2>Changelog</h2>
    <v-expansion-panel class="mt-3">
      <v-expansion-panel-content v-for="(change, index) of changes" :key="index">
        <template v-slot:header>
          <v-layout align-center class="no-select">
            <span class="title mr-3">Version {{ change.version }}</span>
            <v-chip
              v-if="index === 0"
              class="ma-0"
              color="orange"
              text-color="white"
              small
            >
              <v-avatar>
                <v-icon>star</v-icon>
              </v-avatar>
              New
            </v-chip>
            <v-spacer />
            <span class="subheading mr-3">Released: {{ change.date }}</span>
          </v-layout>
        </template>
        <v-card class="grey lighten-4">
          <v-card-text>
            <div v-for="update of change.updates" :key="update.title">
              <h3 v-text="update.title" />
              <ul>
                <li v-for="item of update.items" :key="item" v-text="item" />
              </ul>
            </div>
          </v-card-text>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue'

interface IChange {
  version: string
  date: string
  summary: string
  updates: {
    title: 'Features' | 'Fixes' | 'Developer'
    items: string[]
  }[]
}

export default Vue.extend({
  name: 'Home',

  computed: {
    changes (): IChange[] {
      return [
        {
          version: '1.1',
          date: '15 Oct 2019',
          summary: 'Adds support for different types of congregations',
          updates: [
            {
              title: 'Features',
              items: [
                'Remove concept of abbreviated names',
                'Warning if an assignee is on multiple assignments in one week',
                'Add logo',
                'Second school support',
                'Add Readme',
                'Relocates website to custom domain',
                'Add Changelog to Homepage'
              ]
            },
            {
              title: 'Fixes',
              items: [
                'Default language selection on adding/editing members',
                'More responsive design',
                'Simplifies user experience for changing languages and logging in',
                'Date picker no longer closes immediately',
                'Use correct color on printed schedule for Treasures bullet points',
                'Clears month data when leaving schedule page',
                'Update layout of schedule printout to support second school'
              ]
            },
            {
              title: 'Developer',
              items: [
                'Update packages',
                'Add License',
                'Changes to Jest for testing',
                'Converts project to Typescript',
                'Enforces commit styling'
              ]
            }
          ]
        },
        {
          version: '1.0',
          date: '13 Feb 2019',
          summary: 'Initial release of OCLM Planner',
          updates: [
            {
              title: 'Features',
              items: [
                'Individual or bulk upload of congregation members',
                'Per-member privileges',
                'Automatic download of schedule information',
                'Member suggestions for each assignment',
                'Special week support',
                'Multi-language group support',
                'PDF export of schedule and assignment slips'
              ]
            }
          ]
        }
      ]
    }
  }
})
</script>

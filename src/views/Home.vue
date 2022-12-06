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
    <v-expansion-panel v-model="panel" expand class="mt-3">
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
          <v-card-title class="headline" v-text="change.summary" />
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

  data: () => ({
    panel: [true]
  }),

  computed: {
    changes (): IChange[] {
      return [
        {
          version: '1.3.2',
          date: '06 Dec 2022',
          summary: 'Export Years',
          updates: [
            {
              title: 'Features',
              items: [
                'Adds more years to export field'
              ]
            }
          ]
        },
        {
          version: '1.3.1',
          date: '22 Jan 2022',
          summary: 'Maintenance',
          updates: [
            {
              title: 'Fixes',
              items: [
                'Removes labels from navigation menu',
                'Reduces execution time of scrape to avoid timeouts'
              ]
            },
            {
              title: 'Developer',
              items: [
                'Replaced request-promise with node-fetch to reduce execution time'
              ]
            }
          ]
        },
        {
          version: '1.3.0',
          date: '02 Dec 2021',
          summary: 'Per-Language Privileges',
          updates: [
            {
              title: 'Features',
              items: [
                'Allow different privileges between groups'
              ]
            }
          ]
        },
        {
          version: '1.2.1',
          date: '28 Nov 2021',
          summary: '2022 Support',
          updates: [
            {
              title: 'Fixes',
              items: [
                'Export now available for 2022'
              ]
            }
          ]
        },
        {
          version: '1.2.0',
          date: '03 Jun 2021',
          summary: 'Language Support',
          updates: [
            {
              title: 'Features',
              items: [
                'Spanish language support added',
                'Adds nicer reference for current CBS book',
                'Automatically assign Apply Yourself videos to the chairman',
                'Remove Ministry Video privilege'
              ]
            },
            {
              title: 'Developer',
              items: [
                'Update congregation settings'
              ]
            }
          ]
        },
        {
          version: '1.1.4',
          date: '20 Nov 2020',
          summary: '2021 Support',
          updates: [
            {
              title: 'Fixes',
              items: [
                'Export now available for 2021'
              ]
            }
          ]
        },
        {
          version: '1.1.3',
          date: '20 Nov 2019',
          summary: '2020 Fixes',
          updates: [
            {
              title: 'Fixes',
              items: [
                'Week downloader/scraper now adapted to work with site changes for 2020',
                'Export now available for 2020'
              ]
            }
          ]
        },
        {
          version: '1.1.2',
          date: '30 Oct 2019',
          summary: 'Updates for Gems & UX improvements',
          updates: [
            { title: 'Features', items: ['Tooltips added to some privileges to clarify which item they apply to'] },
            {
              title: 'Fixes',
              items: [
                'Gems time no longer always shows "(10 min.)" on the schedule',
                'Gems time is downloaded properly from the site rather than always being set to "(8 min.)"',
                'Page now scrolls to the top after changing pages'
              ]
            }
          ]
        },
        {
          version: '1.1.1',
          date: '19 Oct 2019',
          summary: 'Fix schedule & second school display preferences',
          updates: [
            { title: 'Features', items: ['Exclude second school assignments on Circuit Overseer visits'] },
            {
              title: 'Fixes',
              items: [
                'Use congregation display name rather than always showing Canton on the PDF',
                'Default school preference to Any when editing a member that did not previously set a preference'
              ]
            },
            { title: 'Developer', items: ['Use a settings file rather than multiple env variables'] }
          ]
        },
        {
          version: '1.1.0',
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
          version: '1.0.0',
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

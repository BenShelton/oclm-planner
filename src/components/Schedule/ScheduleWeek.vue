<template>
  <VCard>
    <VToolbar :color="toolbarColor">
      <VToolbarTitle v-text="prettyDate" />
    </VToolbar>

    <!-- Loading Week Display -->
    <VLayout v-if="!week" justify-center class="pa-3">
      <VLayout v-if="loadError" column align-center>
        <VIcon color="red">
          warning
        </VIcon>
        <p class="text-xs-center red--text">
          An error occured when loading this week
        </p>
      </VLayout>
      <VProgressCircular v-else indeterminate color="primary" />
    </VLayout>

    <!-- Unscraped Week Display -->
    <VLayout v-else-if="!week.scraped" justify-center class="pa-3">
      <VLayout v-if="week.unavailable" column align-center>
        <VIcon color="primary">
          info
        </VIcon>
        <p class="pt-3 text-xs-center primary--text">
          This week date cannot be organised, only weeks from Jan 2019 are available
        </p>
      </VLayout>
      <VLayout v-else-if="!scrapeError" column align-center>
        <VIcon color="primary">
          info
        </VIcon>
        <p class="pt-3 text-xs-center primary--text">
          Assignment information for this week hasn't been downloaded yet, click the button below if you would like to try and download this week's information
        </p>
        <VBtn
          color="primary"
          :loading="scrapeLoading"
          :disabled="scrapeLoading"
          @click="onScrape"
        >
          Download
        </VBtn>
      </VLayout>
      <VLayout v-else column align-center>
        <VIcon color="error">
          warning
        </VIcon>
        <p class="pt-3 text-xs-center error--text">
          There was an error scraping this week's data (most likely because the information isn't available yet on WOL) if you believe this is a mistake contact support
        </p>
      </VLayout>
    </VLayout>

    <!-- Assignment Display -->
    <VList
      v-else
      two-line
      subheader
      class="pa-0"
    >
      <ScheduleAssignment :assignment="assignments.chairman" @edit="onEdit" />
      <ScheduleAssignment :assignment="assignments.openingPrayer" @edit="onEdit" />

      <ScheduleSection title="TREASURES FROM GOD'S WORD" color="grey darken-2">
        <ScheduleAssignment :assignment="assignments.highlights" @edit="onEdit" />
        <ScheduleAssignment :assignment="assignments.gems" @edit="onEdit" />
        <ScheduleAssignment :assignment="assignments.bibleReading" @edit="onEdit" />
      </ScheduleSection>

      <ScheduleSection title="APPLY YOURSELF TO THE FIELD MINISTRY" color="yellow darken-3">
        <ScheduleAssignment :assignment="assignments.studentTalk1" @edit="onEdit" />
        <ScheduleAssignment :assignment="assignments.studentTalk2" @edit="onEdit" />
        <ScheduleAssignment :assignment="assignments.studentTalk3" @edit="onEdit" />
        <ScheduleAssignment :assignment="assignments.studentTalk4" @edit="onEdit" />
      </ScheduleSection>

      <ScheduleSection title="LIVING AS CHRISTIANS" color="red darken-2">
        <ScheduleAssignment :assignment="assignments.serviceTalk1" @edit="onEdit" />
        <ScheduleAssignment :assignment="assignments.serviceTalk2" @edit="onEdit" />
        <ScheduleAssignment :assignment="assignments.congregationBibleStudy" @edit="onEdit" />
        <ScheduleAssignment :assignment="assignments.reader" @edit="onEdit" />
        <ScheduleAssignment :assignment="assignments.closingPrayer" @edit="onEdit" />
      </ScheduleSection>
    </VList>

    <!-- Edit Assignment Dialog -->
    <VDialog
      v-model="editDialog"
      lazy
    >
      <VCard>
        <VCardTitle>
          <span class="headline" v-text="editTitle" />
        </VCardTitle>
        <VCardText>
          <VLayout wrap>
            <VFlex v-if="editName.includes('studentTalk')" xs12>
              <VSelect
                v-model="editAssignment.type"
                label="Type"
                :items="[
                  { text: 'Ministry Video', value: 'MINISTRY_VIDEO' },
                  { text: 'Initial Call', value: 'INITIAL_CALL' },
                  { text: 'Return Visit', value: 'RETURN_VISIT' },
                  { text: 'Bible Study', value: 'BIBLE_STUDY' },
                  { text: 'Talk', value: 'STUDENT_TALK' }
                ]"
              />
            </VFlex>
            <VFlex v-if="!(['CHAIRMAN', 'PRAYER', 'GEMS', 'READER'].includes(editAssignment.type))" class="xs12 sm6 md4 px-2">
              <VTextField
                v-model="editAssignment.title"
                label="Title"
              />
            </VFlex>
            <VFlex class="xs12 sm6 md4 px-2">
              <AssigneeSelect
                v-model="editAssignment.assignee"
                label="Assignee"
              />
            </VFlex>
            <VFlex v-if="['INITIAL_CALL', 'RETURN_VISIT', 'BIBLE_STUDY'].includes(editAssignment.type)" class="xs12 sm6 md4 px-2">
              <AssigneeSelect
                v-model="editAssignment.assistant"
                label="Assistant"
              />
            </VFlex>
            <VFlex v-if="!(['CHAIRMAN', 'PRAYER', 'READER'].includes(editAssignment.type))" class="xs12 sm6 md4 px-2">
              <VTextField
                v-model="editAssignment.time"
                label="Time"
              />
            </VFlex>
          </VLayout>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            flat
            color="grey"
            :disabled="editLoading"
            @click="closeEditor"
          >
            CANCEL
          </VBtn>
          <VBtn
            flat
            color="primary"
            :disabled="editLoading"
            :loading="editLoading"
            @click="saveEditor"
          >
            SAVE
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script>
import { mapActions } from 'vuex'

import ScheduleSection from '@/components/Schedule/ScheduleSection'
import ScheduleAssignment from '@/components/Schedule/ScheduleAssignment'
import AssigneeSelect from '@/components/AssigneeSelect'

import { ASSIGNMENT_TYPE_MAP } from '@/constants'

export default {
  name: 'ScheduleWeek',

  components: {
    ScheduleSection,
    ScheduleAssignment,
    AssigneeSelect
  },

  props: {
    weekDate: { type: String, required: true },
    current: { type: Boolean, required: true }
  },

  mounted () {
    if (this.weekDate < '2019-01-07') {
      this.week = { date: this.weekDate, unavailable: true }
      return
    }
    this.loadWeek({ date: this.weekDate })
      .then(week => { this.week = week })
      .catch(err => {
        this.loadError = true
        console.error(err)
      })
  },

  data () {
    return {
      week: null,
      loadError: false,
      scrapeLoading: false,
      scrapeError: false,
      editDialog: false,
      editName: '',
      editTitle: '',
      editAssignment: {},
      editLoading: false
    }
  },

  computed: {
    toolbarColor () {
      return this.current ? 'primary' : 'grey'
    },
    prettyDate () {
      const { weekDate } = this
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const [year, month, day] = weekDate.split('-')
      return `${day} ${months[month - 1]} ${year}`
    },
    assignments () {
      const { assignments } = this.week
      const assignmentRefs = [
        { name: 'chairman', displayName: 'Chairman' },
        { name: 'openingPrayer', displayName: 'Opening Prayer' },
        { name: 'highlights', displayName: 'Highlights' },
        { name: 'gems', displayName: 'Gems' },
        { name: 'bibleReading', displayName: 'Bible Reading' },
        { name: 'studentTalk1', displayName: 'Student Talk 1' },
        { name: 'studentTalk2', displayName: 'Student Talk 2' },
        { name: 'studentTalk3', displayName: 'Student Talk 3' },
        { name: 'studentTalk4', displayName: 'Student Talk 4' },
        { name: 'serviceTalk1', displayName: 'Service Talk 1' },
        { name: 'serviceTalk2', displayName: 'Service Talk 2' },
        { name: 'congregationBibleStudy', displayName: 'Congregation Bible Study' },
        { name: 'reader', displayName: 'Reader' },
        { name: 'closingPrayer', displayName: 'Closing Prayer' }
      ]
      return assignmentRefs.reduce((acc, { name, displayName }) => {
        return Object.assign(acc, {
          [name]: {
            name,
            displayName,
            details: assignments[name]
          }
        })
      }, {})
    }
  },

  methods: {
    ...mapActions({
      loadWeek: 'schedule/loadWeek',
      scrapeWeek: 'schedule/scrapeWeek',
      updateAssignment: 'schedule/updateAssignment'
    }),
    onScrape () {
      this.scrapeLoading = true
      this.scrapeWeek({ weekID: this.week._id })
        .then(week => { this.week = week })
        .catch(err => {
          this.scrapeError = true
          console.error(err)
        })
        .finally(() => { this.scrapeLoading = false })
    },
    onEdit (name) {
      this.editName = name
      const { displayName, details } = this.assignments[name]
      this.editTitle = `Editing ${displayName} for week ${this.prettyDate}`
      const assignment = { ...details }
      if (!assignment.type) assignment.type = ASSIGNMENT_TYPE_MAP[name]
      this.editAssignment = assignment
      this.editDialog = true
    },
    closeEditor () {
      this.editDialog = false
    },
    saveEditor () {
      this.editLoading = true
      this.updateAssignment({
        weekID: this.week._id,
        name: this.editName,
        assignment: this.editAssignment
      })
        .then(week => {
          this.week = week
          this.closeEditor()
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.editLoading = false
        })
    }
  }
}
</script>

<template>
  <VCard>
    <VToolbar :color="toolbarColor">
      <VToolbarTitle v-text="prettyDate" />
      <VSpacer />
      <VMenu
        v-if="localWeek.loaded"
        v-model="settingsMenu"
        lazy
        left
        offset-y
        :close-on-content-click="false"
      >
        <VBtn slot="activator" flat icon>
          <VIcon>settings</VIcon>
        </VBtn>
        <VCard class="pa-3">
          <VLayout justify-center>
            <VBtn
              color="primary"
              :loading="scrapeLoading"
              :disabled="scrapeLoading"
              @click="onScrape"
            >
              Redownload
              <VIcon right>
                cloud_download
              </VIcon>
            </VBtn>
          </VLayout>
          <VDivider class="mt-3" />
          <VRadioGroup
            v-model="weekType"
            hide-details
            label="Week Type"
            :disabled="weekTypeLoading"
          >
            <VRadio
              v-for="type in WEEK_TYPES"
              :key="type.value"
              class="ml-3"
              :ripple="false"
              :label="type.label"
              :value="type.value"
            />
          </VRadioGroup>
          <template v-if="week.type === WEEK_TYPES.coVisit.value">
            <VDivider class="my-3" />
            <label class="v-label theme--light py-2">
              Circuit Overseer Details
            </label>
            <VTextField :value="week.coName" label="Name" @change="onUpdateCOName" />
            <VTextarea
              label="Talk Title"
              :value="week.coTitle"
              :rows="1"
              :auto-grow="true"
              @change="onUpdateCOTitle"
            />
          </template>
        </VCard>
      </Vmenu>
    </VToolbar>

    <!-- Loading Week Display -->
    <VLayout v-if="!localWeek.loaded" justify-center class="pa-3">
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

    <!-- Unavailable Week Display -->
    <VLayout v-else-if="localWeek.unavailable" justify-center class="pa-3">
      <VLayout column align-center>
        <VIcon color="primary">
          info
        </VIcon>
        <p class="pt-3 text-xs-center primary--text">
          This week date cannot be organised, only weeks from Jan 2019 are available
        </p>
      </VLayout>
    </VLayout>

    <!-- Assembly/Memorial Week Display -->
    <VLayout v-else-if="week.type === WEEK_TYPES.assembly.value || week.type === WEEK_TYPES.memorial.value" justify-center class="pa-3">
      <VLayout class="pt-3" column align-center>
        <VIcon large color="primary" v-text="week.type === WEEK_TYPES.assembly.value ? 'group' : 'public'" />
        <p class="headline text-xs-center primary--text mt-3" v-text="week.type === WEEK_TYPES.assembly.value ? 'Assembly Week' : 'Memorial Week'" />
      </VLayout>
    </VLayout>

    <!-- Unscraped Week Display -->
    <VLayout v-else-if="!week.scraped" justify-center class="pa-3">
      <VLayout v-if="!scrapeError" column align-center>
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
        <div class="pt-3 text-xs-center error--text">
          <p>There was an error scraping this week's data</p>
          <p>This is most likely because the information isn't available yet on WOL, but may also be because of a special week such as the Memorial</p>
          <p>If you believe this is a mistake please contact support</p>
        </div>
      </VLayout>
    </VLayout>

    <!-- Assignment Display -->
    <template v-else>
      <div v-if="coVisit" class="pa-0">
        <p class="headline text-xs-center primary--text py-2 ma-0">
          Circuit Overseer Visit
        </p>
        <VDivider />
      </div>

      <VList two-line subheader class="pa-0">
        <ScheduleAssignment :assignment="assignments.chairman" @edit="onEdit" />
        <ScheduleAssignment :assignment="assignments.openingPrayer" @edit="onEdit" />

        <ScheduleSection title="TREASURES FROM GOD'S WORD" color="TREASURES">
          <ScheduleAssignment :assignment="assignments.highlights" @edit="onEdit" />
          <ScheduleAssignment :assignment="assignments.gems" @edit="onEdit" />
          <ScheduleAssignment :assignment="assignments.bibleReading" @edit="onEdit" />
        </ScheduleSection>

        <ScheduleSection title="APPLY YOURSELF TO THE FIELD MINISTRY" color="MINISTRY">
          <ScheduleAssignment :assignment="assignments.studentTalk1" @edit="onEdit" />
          <ScheduleAssignment :assignment="assignments.studentTalk2" @edit="onEdit" />
          <ScheduleAssignment :assignment="assignments.studentTalk3" @edit="onEdit" />
          <ScheduleAssignment :assignment="assignments.studentTalk4" @edit="onEdit" />
        </ScheduleSection>

        <ScheduleSection title="LIVING AS CHRISTIANS" color="LIVING">
          <ScheduleAssignment :assignment="assignments.serviceTalk1" @edit="onEdit" />
          <ScheduleAssignment :assignment="assignments.serviceTalk2" @edit="onEdit" />
          <ScheduleAssignment v-if="!coVisit" :assignment="assignments.congregationBibleStudy" @edit="onEdit" />
          <ScheduleAssignment v-if="!coVisit" :assignment="assignments.reader" @edit="onEdit" />
          <ScheduleAssignment :assignment="assignments.closingPrayer" @edit="onEdit" />
        </ScheduleSection>
      </VList>
    </template>

    <!-- Edit Assignment Dialog -->
    <VDialog
      v-model="editDialog"
      lazy
      max-width="900px"
    >
      <VCard>
        <VCardTitle>
          <span class="headline" v-text="editTitle" />
        </VCardTitle>
        <VCardText>
          <VContainer grid-list-md>
            <VLayout wrap>
              <VFlex
                xs12
                md6
                sm4
              >
                <AssigneeSelect v-model="editAssignment.assignee" label="Assignee" :type="editAssignment.type" />
              </VFlex>
              <VFlex
                v-if="['initialCall', 'returnVisit', 'bibleStudy'].includes(editAssignment.type)"
                xs12
                md6
                sm4
              >
                <AssigneeSelect v-model="editAssignment.assistant" label="Assistant" :type="editAssignment.type + 'Assist'" />
              </VFlex>
              <VFlex
                v-if="editName.includes('studentTalk')"
                xs12
                md6
                sm4
              >
                <VSelect
                  v-model="editAssignment.type"
                  label="Type"
                  :items="[
                    { text: 'Ministry Video', value: 'ministryVideo' },
                    { text: 'Initial Call', value: 'initialCall' },
                    { text: 'Return Visit', value: 'returnVisit' },
                    { text: 'Bible Study', value: 'bibleStudy' },
                    { text: 'Talk', value: 'studentTalk' }
                  ]"
                />
              </VFlex>
              <VFlex
                v-if="!(['chairman', 'prayer', 'gems', 'reader'].includes(editAssignment.type))"
                xs12
                md6
                sm4
              >
                <VTextField v-model="editAssignment.title" label="Title" />
              </VFlex>
              <VFlex
                v-if="['bibleReading', 'initialCall', 'returnVisit', 'bibleStudy', 'studentTalk'].includes(editAssignment.type)"
                xs12
                md6
                sm4
              >
                <VTextField v-model="editAssignment.studyPoint" label="Study Point" />
              </VFlex>
              <VFlex
                v-if="!(['chairman', 'prayer', 'reader'].includes(editAssignment.type))"
                xs12
                md6
                sm4
              >
                <VTextField v-model="editAssignment.time" label="Time" />
              </VFlex>
            </VLayout>
            <VAlert
              :value="editAssignment.text !== 'N/A'"
              color="info"
              icon="info"
              outline
            >
              <span class="font-weight-bold">
                Downloaded Text From WOL:
              </span>
              <span v-if="!editAssignment.text" class="error--text">
                Text was not downloaded for this assignment, it may have been manually added
              </span>
              <span v-else v-text="editAssignment.text" />
            </VAlert>
          </VContainer>
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
import { mapGetters, mapActions, mapMutations } from 'vuex'

import ScheduleSection from '@/components/Schedule/ScheduleSection'
import ScheduleAssignment from '@/components/Schedule/ScheduleAssignment'
import AssigneeSelect from '@/components/AssigneeSelect'

import { ASSIGNMENT_TYPE_MAP, WEEK_TYPES } from '@/constants'

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
      Object.assign(this.localWeek, { date: this.weekDate, loaded: true, unavailable: true })
      return
    }
    this.loadWeek({ date: this.weekDate })
      .then(this.loadLocalWeek)
      .catch(err => {
        this.loadError = true
        console.error(err)
      })
  },

  data () {
    return {
      WEEK_TYPES,
      localWeek: { _id: null, type: 0, loaded: false },
      loadError: false,
      scrapeLoading: false,
      scrapeError: false,
      settingsMenu: false,
      weekTypeLoading: false,
      editDialog: false,
      editName: '',
      editTitle: '',
      editAssignment: {},
      editLoading: false
    }
  },

  computed: {
    ...mapGetters({
      language: 'schedule/language'
    }),
    week () {
      return this.localWeek[this.language] || {}
    },
    weekID () {
      return this.localWeek._id
    },
    weekType: {
      get () {
        return this.week.type || 0
      },
      set (val) {
        const prev = this.weekType
        this.week.type = val
        // wait for the animation to finish
        setTimeout(() => {
          if (!window.confirm('Are you sure you want to change the week type? All items may be unassigned.')) {
            this.week.type = prev
            return
          }
          this.weekTypeLoading = true
          this.updateWeekType({ weekID: this.weekID, type: val })
            .then(this.loadLocalWeek)
            .then(() => {
              this.alert({ text: 'Week Type successfully updated', color: 'success' })
              this.settingsMenu = false
            })
            .catch(err => {
              this.week.type = prev
              this.alert({ text: 'Week Type could not be toggled', color: 'error' })
              console.error(err)
            })
            .finally(() => { this.weekTypeLoading = false })
        }, 100)
      }
    },
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
    },
    coVisit () {
      return this.weekType === WEEK_TYPES.coVisit.value
    }
  },

  methods: {
    ...mapActions({
      loadWeek: 'schedule/loadWeek',
      scrapeWeek: 'schedule/scrapeWeek',
      updateAssignment: 'schedule/updateAssignment',
      updateWeekType: 'schedule/updateWeekType',
      updateCOName: 'schedule/updateCOName',
      updateCOTitle: 'schedule/updateCOTitle'
    }),
    ...mapMutations({
      alert: 'alert/UPDATE_ALERT'
    }),
    loadLocalWeek (week) {
      this.localWeek = Object.assign({}, { loaded: true }, week)
    },
    onUpdateCOName (name) {
      this.updateCOName({ weekID: this.weekID, name })
        .then(this.loadLocalWeek)
        .catch(() => {
          this.alert({ text: 'Circuit Overseer Name could not be updated.', color: 'error' })
        })
    },
    onUpdateCOTitle (title) {
      this.updateCOTitle({ weekID: this.weekID, title })
        .then(this.loadLocalWeek)
        .catch(() => {
          this.alert({ text: 'Circuit Overseer Talk Title could not be updated.', color: 'error' })
        })
    },
    onScrape () {
      this.scrapeLoading = true
      this.scrapeWeek({ weekID: this.weekID })
        .then(this.loadLocalWeek)
        .then(() => this.alert({ text: 'Week successfully downloaded', color: 'success' }))
        .catch(err => {
          this.scrapeError = true
          this.alert({ text: 'Week could not be downloaded', color: 'error' })
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
        weekID: this.localWeek._id,
        name: this.editName,
        assignment: this.editAssignment
      })
        .then(this.loadLocalWeek)
        .then(this.closeEditor)
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

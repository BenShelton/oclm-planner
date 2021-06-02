<template>
  <v-card>
    <v-toolbar :color="toolbarColor" class="elevation-0">
      <v-toolbar-title v-text="prettyDate" />
      <v-spacer />
      <v-menu
        v-if="localWeekLoaded && !localWeekUnavailable"
        v-model="settingsMenu"
        lazy
        left
        offset-y
        :close-on-content-click="false"
      >
        <v-btn slot="activator" flat icon>
          <v-icon>settings</v-icon>
        </v-btn>
        <v-card class="pa-3">
          <v-layout justify-center>
            <v-btn
              color="primary"
              :loading="scrapeLoading"
              :disabled="scrapeLoading"
              @click="onScrape"
            >
              Redownload
              <v-icon right>
                cloud_download
              </v-icon>
            </v-btn>
          </v-layout>
          <v-divider class="mt-3" />
          <v-radio-group
            v-model="weekType"
            hide-details
            label="Week Type"
            :disabled="weekTypeLoading"
          >
            <v-radio
              v-for="type in WEEK_TYPES"
              :key="type.value"
              class="ml-3"
              :ripple="false"
              :label="type.label"
              :value="type.value"
            />
          </v-radio-group>
          <template v-if="week.type === WEEK_TYPES.coVisit.value">
            <v-divider class="my-3" />
            <label class="v-label theme--light py-2">
              Circuit Overseer Details
            </label>
            <v-text-field :value="week.coName" label="Name" @change="onUpdateCOName" />
            <v-textarea
              label="Talk Title"
              :value="week.coTitle"
              :rows="1"
              :auto-grow="true"
              @change="onUpdateCOTitle"
            />
          </template>
        </v-card>
      </v-menu>
    </v-toolbar>
    <v-divider />

    <!-- Loading Week Display -->
    <v-layout v-if="!localWeekLoaded" justify-center class="pa-3">
      <v-layout v-if="loadError" column align-center>
        <v-icon color="red">
          warning
        </v-icon>
        <p class="text-xs-center red--text">
          An error occured when loading this week
        </p>
      </v-layout>
      <v-progress-circular v-else indeterminate color="primary" />
    </v-layout>

    <!-- Unavailable Week Display -->
    <v-layout v-else-if="localWeekUnavailable" justify-center class="pa-3">
      <v-layout column align-center>
        <v-icon color="primary">
          info
        </v-icon>
        <p class="pt-3 text-xs-center primary--text">
          This week date cannot be organised, only weeks from Jan 2019 are available
        </p>
      </v-layout>
    </v-layout>

    <!-- Assembly/Memorial Week Display -->
    <v-layout v-else-if="week.type === WEEK_TYPES.assembly.value || week.type === WEEK_TYPES.memorial.value" justify-center class="pa-3">
      <v-layout class="pt-3" column align-center>
        <v-icon large color="primary" v-text="week.type === WEEK_TYPES.assembly.value ? 'group' : 'public'" />
        <p class="headline text-xs-center primary--text mt-3" v-text="week.type === WEEK_TYPES.assembly.value ? 'Assembly Week' : 'Memorial Week'" />
      </v-layout>
    </v-layout>

    <!-- Unscraped Week Display -->
    <v-layout v-else-if="!week.scraped" justify-center class="pa-3">
      <v-layout v-if="!scrapeError" column align-center>
        <v-icon color="primary">
          info
        </v-icon>
        <p class="pt-3 text-xs-center primary--text">
          Assignment information for this week hasn't been downloaded yet, click the button below if you would like to try and download this week's information
        </p>
        <v-btn
          color="primary"
          :loading="scrapeLoading"
          :disabled="scrapeLoading"
          @click="onScrape"
        >
          Download
        </v-btn>
      </v-layout>
      <v-layout v-else column align-center>
        <v-icon color="error">
          warning
        </v-icon>
        <div class="pt-3 text-xs-center error--text">
          <p>There was an error scraping this week's data</p>
          <p>This is most likely because the information isn't available yet on WOL, but may also be because of a special week such as the Memorial</p>
          <p>If you believe this is a mistake please contact support</p>
        </div>
      </v-layout>
    </v-layout>

    <!-- Assignment Display -->
    <template v-else>
      <div v-if="coVisit" class="pa-0">
        <p class="headline text-xs-center primary--text py-2 ma-0">
          Circuit Overseer Visit
        </p>
        <v-divider />
      </div>

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
    </template>

    <!-- Edit Assignment Dialog -->
    <v-dialog
      v-model="editDialog"
      lazy
      max-width="900px"
    >
      <v-card>
        <v-card-title>
          <span class="headline" v-text="editTitle" />
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <template v-if="language !== 'en'">
                <v-flex :class="fieldClass">
                  <v-checkbox
                    v-model="editAssignment.stream"
                    label="Listen to Video from JW Streaming"
                    :disabled="!!editAssignment.inherit"
                    @change="onSettingChange"
                  />
                </v-flex>
                <v-flex :class="fieldClass">
                  <v-checkbox
                    v-model="editAssignment.inherit"
                    label="Inherit Assignment from English"
                    :disabled="!!editAssignment.stream"
                    @change="onSettingChange"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-divider class="mb-3" />
                </v-flex>
              </template>
              <v-flex :class="fieldClass">
                <AssigneeSelect
                  v-model="editAssignment.assignee"
                  label="Assignee"
                  :type="editAssignment.type"
                  :school="1"
                  :disabled="!!(editAssignment.stream || editAssignment.inherit)"
                />
              </v-flex>
              <v-flex v-if="hasAssistant" :class="fieldClass">
                <AssigneeSelect
                  v-model="editAssignment.assistant"
                  label="Assistant"
                  :type="editAssignment.type + 'Assist'"
                  :school="1"
                  :disabled="!!(editAssignment.stream || editAssignment.inherit)"
                />
              </v-flex>
              <template v-if="hasSecondSchool">
                <v-flex :class="fieldClass">
                  <AssigneeSelect
                    v-model="editAssignment.assignee2"
                    label="Assignee (2)"
                    :type="editAssignment.type"
                    :school="2"
                    :disabled="!!(editAssignment.stream || editAssignment.inherit)"
                  />
                </v-flex>
                <v-flex v-if="hasAssistant" :class="fieldClass">
                  <AssigneeSelect
                    v-model="editAssignment.assistant2"
                    label="Assistant (2)"
                    :type="editAssignment.type + 'Assist'"
                    :school="2"
                    :disabled="!!(editAssignment.stream || editAssignment.inherit)"
                  />
                </v-flex>
              </template>
              <v-flex v-if="editName.includes('studentTalk')" :class="fieldClass">
                <v-select
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
              </v-flex>
              <v-flex v-if="!(['chairman', 'prayer', 'gems', 'reader'].includes(editAssignment.type))" :class="fieldClass">
                <v-text-field v-model="editAssignment.title" label="Title" />
              </v-flex>
              <v-flex v-if="['bibleReading', 'initialCall', 'returnVisit', 'bibleStudy', 'studentTalk'].includes(editAssignment.type)" :class="fieldClass">
                <v-text-field v-model="editAssignment.studyPoint" label="Study Point" />
              </v-flex>
              <v-flex v-if="!(['chairman', 'prayer', 'reader'].includes(editAssignment.type))" :class="fieldClass">
                <v-text-field v-model="editAssignment.time" label="Time" />
              </v-flex>
            </v-layout>
            <v-alert
              :value="!!multipleAssignments.length"
              color="error"
              icon="warning"
              outline
            >
              <span class="font-weight-bold">
                Warning:
              </span>
              <span>
                The following are already on other assignments this week:
              </span>
              <div v-for="duplicate of multipleAssignments" :key="duplicate.name" class="ml-2">
                <span class="font-weight-bold" v-text="duplicate.name + ': '" />
                <span class="font-italic" v-text="duplicate.assignments.join(', ')" />
              </div>
            </v-alert>
            <v-alert
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
            </v-alert>
          </v-container>
        </v-card-text>
        <v-card-actions class="pb-3">
          <v-btn
            flat
            color="error"
            :disabled="editLoading"
            @click="deleteEditor"
          >
            DELETE
          </v-btn>
          <v-spacer />
          <v-btn
            flat
            color="grey"
            :disabled="editLoading"
            @click="closeEditor"
          >
            CANCEL
          </v-btn>
          <v-btn
            flat
            color="primary"
            :disabled="editLoading"
            :loading="editLoading"
            @click="saveEditor"
          >
            SAVE
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import ScheduleSection from '@/components/Schedule/ScheduleSection.vue'
import ScheduleAssignment from '@/components/Schedule/ScheduleAssignment.vue'
import AssigneeSelect from '@/components/AssigneeSelect.vue'

import { alertModule, scheduleModule, congregationModule } from '@/store'
import { ASSIGNMENT_TYPE_MAP, WEEK_TYPES, SECOND_SCHOOL } from '@/constants'
import { IScheduleWeekLanguage, Languages, ScheduleWeek, Assignments, IScheduleWeekViewAssignment, IScheduleAssignment } from 'types'

type ScheduleWeekViewAssignmentMap = { [key in Assignments]: IScheduleWeekViewAssignment }

@Component({
  components: {
    ScheduleSection,
    ScheduleAssignment,
    AssigneeSelect
  }
})
export default class ScheduleWeekView extends Vue {
  // Props
  @Prop({ type: String, required: true }) readonly weekDate!: string
  @Prop({ type: Boolean, required: true }) readonly current!: boolean

  // Hooks
  mounted () {
    if (this.weekDate < '2019-01-07') {
      Object.assign(this.localWeek, { date: this.weekDate })
      this.localWeekLoaded = true
      this.localWeekUnavailable = true
      return
    }
    scheduleModule.loadWeek({ date: this.weekDate })
      .then(this.loadLocalWeek)
      .catch((err: Error) => {
        this.loadError = true
        console.error(err)
      })
  }

  // Data
  WEEK_TYPES = WEEK_TYPES
  fieldClass: string = 'xs12 md6 xl4'
  localWeek: ScheduleWeek = { _id: '', date: '', en: { assignments: {} }, tpo: { assignments: {} }, es: { assignments: {} } }
  localWeekLoaded = false
  localWeekUnavailable = false
  loadError: boolean = false
  scrapeLoading: boolean = false
  scrapeError: boolean = false
  settingsMenu: boolean = false
  weekTypeLoading: boolean = false
  editDialog: boolean = false
  editName: Assignments = 'bibleReading'
  editTitle: string = ''
  editAssignment: IScheduleAssignment = { title: '', type: 'bibleReading' }
  editLoading: boolean = false

  // Computed
  get language (): Languages {
    return scheduleModule.language
  }

  get week (): IScheduleWeekLanguage {
    return this.localWeek[this.language] || {}
  }

  get weekID (): string {
    return this.localWeek._id
  }

  get weekType (): number {
    return this.week.type || 0
  }
  set weekType (val: number) {
    const prev = this.weekType
    this.$set(this.week, 'type', val)
    // wait for the animation to finish
    setTimeout(() => {
      if (!window.confirm('Are you sure you want to change the week type? All items may be unassigned.')) {
        this.week.type = prev
        return
      }
      this.weekTypeLoading = true
      scheduleModule.updateWeekType({ weekID: this.weekID, type: val })
        .then(this.loadLocalWeek)
        .then(() => {
          alertModule.UPDATE_ALERT({ text: 'Week Type successfully updated', color: 'success' })
          this.settingsMenu = false
        })
        .catch((err: Error) => {
          this.week.type = prev
          alertModule.UPDATE_ALERT({ text: 'Week Type could not be toggled', color: 'error' })
          console.error(err)
        })
        .finally(() => { this.weekTypeLoading = false })
    }, 100)
  }

  get toolbarColor (): string {
    return this.current ? 'primary' : 'grey'
  }

  get prettyDate (): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const [year, month, day] = this.weekDate.split('-')
    return `${day} ${months[+month - 1]} ${year}`
  }

  get assignments (): ScheduleWeekViewAssignmentMap {
    const { coVisit } = this
    const { assignments } = this.week
    const assignmentRefs: { name: Assignments, displayName: string }[] = [
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
      { name: 'reader', displayName: 'CBS Reader' },
      { name: 'closingPrayer', displayName: 'Closing Prayer' }
    ]
    return assignmentRefs.reduce((acc, { name, displayName }) => {
      const assignment = assignments[name]
      const inherit = !!(assignment && assignment.inherit)
      const details = inherit ? this.localWeek.en.assignments[name] : assignment
      const value: IScheduleWeekViewAssignment = {
        name,
        displayName,
        inherit,
        coVisit,
        details
      }
      return Object.assign(acc, { [name]: value })
    }, {}) as ScheduleWeekViewAssignmentMap
  }

  get coVisit (): boolean {
    return this.weekType === WEEK_TYPES.coVisit.value
  }

  get multipleAssignments (): { name: string, assignments: string[] }[] {
    const assignmentFields = ['assignee', 'assistant', 'assignee2', 'assistant2'] as const
    const assignmentFieldsToCheck = assignmentFields.reduce((acc: string[], a) => acc.concat(this.editAssignment[a] || []), [])
    if (!assignmentFieldsToCheck.length) return []
    const multipleAssignments: string[][] = new Array(assignmentFieldsToCheck.length).fill(null).map(() => [])
    for (const assignment of Object.values(this.assignments)) {
      const { details } = assignment
      if (!details || assignment.name === this.editName) continue
      assignmentFieldsToCheck.forEach((field, i) => {
        if (assignmentFields.some(a => details[a] === field)) multipleAssignments[i].push(assignment.displayName)
      })
    }
    return multipleAssignments.reduce((acc: { name: string, assignments: string[] }[], m, i) => {
      if (!m.length) return acc
      const { name } = congregationModule.idMap[assignmentFieldsToCheck[i]]
      return acc.concat({ name, assignments: m })
    }, [])
  }

  get hasAssistant (): boolean {
    return ['initialCall', 'returnVisit', 'bibleStudy'].includes(this.editAssignment.type)
  }

  get hasSecondSchool (): boolean {
    return SECOND_SCHOOL &&
      !this.coVisit &&
      ['initialCall', 'returnVisit', 'bibleStudy', 'studentTalk', 'bibleReading'].includes(this.editAssignment.type)
  }

  // Methods
  loadLocalWeek (week: ScheduleWeek): void {
    this.localWeek = week
    this.localWeekLoaded = true
  }

  onUpdateCOName (name: string): void {
    scheduleModule.updateCOName({ weekID: this.weekID, name })
      .then(this.loadLocalWeek)
      .catch(() => {
        alertModule.UPDATE_ALERT({ text: 'Circuit Overseer Name could not be updated.', color: 'error' })
      })
  }

  onUpdateCOTitle (title: string): void {
    scheduleModule.updateCOTitle({ weekID: this.weekID, title })
      .then(this.loadLocalWeek)
      .catch(() => {
        alertModule.UPDATE_ALERT({ text: 'Circuit Overseer Talk Title could not be updated.', color: 'error' })
      })
  }

  onScrape (): void {
    this.scrapeLoading = true
    scheduleModule.scrapeWeek({ weekID: this.weekID })
      .then(this.loadLocalWeek)
      .then(() => alertModule.UPDATE_ALERT({ text: 'Week successfully downloaded', color: 'success' }))
      .catch(err => {
        this.scrapeError = true
        alertModule.UPDATE_ALERT({ text: 'Week could not be downloaded', color: 'error' })
        console.error(err)
      })
      .finally(() => { this.scrapeLoading = false })
  }

  onEdit (name: Assignments): void {
    this.editName = name
    const { displayName, inherit, details } = this.assignments[name]
    const editDetails = inherit ? this.week.assignments[name] : details
    this.editTitle = `Editing ${displayName} for week ${this.prettyDate}`
    const assignment: IScheduleAssignment = { title: '', type: '', ...editDetails }
    if (!assignment.type) assignment.type = ASSIGNMENT_TYPE_MAP[name]
    this.editAssignment = assignment
    this.editDialog = true
  }

  onSettingChange (val: boolean): void {
    if (val) {
      if (this.editAssignment.assignee) this.editAssignment.assignee = undefined
      if (this.editAssignment.assistant) this.editAssignment.assistant = undefined
      if (this.editAssignment.assignee2) this.editAssignment.assignee2 = undefined
      if (this.editAssignment.assistant2) this.editAssignment.assistant2 = undefined
    }
  }

  deleteEditor (): void {
    this.editLoading = true
    scheduleModule.deleteAssignment({
      weekID: this.localWeek._id,
      name: this.editName
    })
      .then(this.loadLocalWeek)
      .then(this.closeEditor)
      .catch((err: Error) => {
        console.error(err)
      })
      .finally(() => {
        this.editLoading = false
      })
  }

  closeEditor (): void {
    this.editDialog = false
  }

  saveEditor (): void {
    this.editLoading = true
    scheduleModule.updateAssignment({
      weekID: this.localWeek._id,
      name: this.editName,
      assignment: this.editAssignment
    })
      .then(this.loadLocalWeek)
      .then(this.closeEditor)
      .catch((err: Error) => {
        console.error(err)
      })
      .finally(() => {
        this.editLoading = false
      })
  }
}
</script>

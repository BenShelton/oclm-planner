<template>
  <VLayout column>
    <p>Select a month/year below and click the buttons to generate a schedule.</p>
    <VLayout wrap shrink justify-center>
      <VFlex xs12 sm6 md4>
        <VSelect
          v-model="month"
          class="mx-4"
          label="Month"
          :items="months"
        />
      </VFlex>
      <VFlex xs12 sm6 md4>
        <VSelect
          v-model="year"
          class="mx-4"
          label="Year"
          :items="years"
        />
      </VFlex>
    </VLayout>
    <VLayout wrap justify-center class="px-3">
      <VBtn color="primary" @click="previewSchedule">
        Preview Schedule
        <VIcon right dark>
          find_in_page
        </VIcon>
      </VBtn>
    </VLayout>
    <PDFPreview
      v-model="showPreview"
      :pdf="pdf"
      :error="generationError"
    />
  </VLayout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

import PDFPreview from '@/components/PDFPreview'
import { COLORS } from '@/constants'

pdfMake.vfs = pdfFonts.pdfMake.vfs

export default {
  name: 'Export',

  components: {
    PDFPreview
  },

  data () {
    const today = new Date()
    return {
      month: (today.getMonth() + 1).toString().padStart(2, '0'),
      months: [
        { text: 'January', value: '01' },
        { text: 'February', value: '02' },
        { text: 'March', value: '03' },
        { text: 'April', value: '04' },
        { text: 'May', value: '05' },
        { text: 'June', value: '06' },
        { text: 'July', value: '07' },
        { text: 'August', value: '08' },
        { text: 'September', value: '09' },
        { text: 'October', value: '10' },
        { text: 'November', value: '11' },
        { text: 'December', value: '12' }
      ],
      year: today.getFullYear().toString(),
      years: ['2019'],
      previewedMonth: null,
      pdf: null,
      showPreview: false,
      generationError: false
    }
  },

  computed: {
    ...mapGetters({
      idMap: 'congregation/idMap'
    })
  },

  methods: {
    ...mapActions({
      loadMonth: 'schedule/loadMonth'
    }),
    setTime (time) {
      this.time = time
      return time
    },
    addTime (minutes) {
      const toAdd = parseInt(/\d+/.exec(minutes)[0])
      let [h, m] = this.time.split(':').map(Number)
      m += toAdd
      if (m > 59) {
        m -= 60
        h++
      }
      const time = `${h}:${m.toString().padStart(2, '0')}`
      this.time = time
      return time
    },
    getAssignmentTitle (assignment) {
      const { title, time } = assignment
      return `${title} (${time})`
    },
    getAssigneeName (assignment, includeAssistant) {
      const assignee = this.idMap[assignment.assignee]
      let name = assignee ? assignee.name : '-'
      if (includeAssistant) {
        const assistant = this.idMap[assignment.assistant]
        name += `/${assistant ? assistant.name : '-'}`
      }
      return name
    },
    previewSchedule () {
      this.generationError = false
      this.showPreview = true
      const month = this.year + '-' + this.month
      if (this.previewedMonth === month) return
      this.pdf = null
      this.loadMonth({ month })
        .then(weeks => {
          this.generateSchedule(weeks)
          this.previewedMonth = month
        })
        .catch(err => {
          this.generationError = true
          this.previewedMonth = null
          console.error(err)
        })
    },
    generateSchedule (weeks) {
      const stack = []
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [36, 62, 36, 44],
        pageBreakBefore: ({ id }) => id === 'PageStartSeparator',
        defaultStyle: {
          fontSize: 9,
          noWrap: true
        },
        header: {
          margin: [44, 36, 44, 0],
          stack: [
            {
              columns: [
                { text: 'CANTON CONGREGATION', width: 160, margin: [0, 8, 0, 0], bold: true },
                { text: 'Our Christian Life & Ministry Schedule', alignment: 'right', fontSize: 17, bold: true }
              ]
            }
          ]
        },
        footer (currentPage) {
          const startingWeek = currentPage * 2 - 1
          const text = startingWeek === weeks.length ? `WEEK ${startingWeek}` : `WEEKS ${startingWeek} & ${startingWeek + 1}`
          return { text, margin: [0, 0, 44, 36], alignment: 'right', bold: true }
        },
        content: [
          { margin: [8, 0], stack }
        ]
      }

      stack.push(this.createSeparator(false))
      weeks.forEach((week, index) => {
        const { date, weeklyBibleReading, songs, assignments } = week
        const {
          openingPrayer,
          chairman,
          highlights,
          gems,
          bibleReading,
          serviceTalk1,
          serviceTalk2,
          congregationBibleStudy,
          reader,
          closingPrayer
        } = assignments
        if (index > 0 && index % 2 === 0) stack.push(this.createSeparator(true))
        const [, month, day] = date.split('-')
        const titleDay = day.charAt(0) === '0' ? day.charAt(1) : day
        const titleMonth = this.months.find(m => m.value === month).text.substr(0, 3)
        stack.push({
          text: `${titleDay} ${titleMonth} | WEEKLY BIBLE READING: ${weeklyBibleReading}`,
          fontSize: 14,
          bold: true
        })
        stack.push({ text: 'Time Off', bold: true, decoration: 'underline', alignment: 'right' })
        stack.push(this.createTable(COLORS.TREASURES, [
          [this.setTime('7:00'), songs[0], 'Prayer:', this.getAssigneeName(openingPrayer), this.addTime(5)],
          [this.time, 'Opening Comments (3 min.)', 'Chairman:', this.getAssigneeName(chairman), this.addTime(3)]
        ]))
        stack.push(this.createSubheader('TREASURES FROM GOD\'S WORD', COLORS.TREASURES))
        stack.push(this.createTable(COLORS.MINISTRY, [
          [this.time, this.getAssignmentTitle(highlights), null, this.getAssigneeName(highlights), this.addTime(highlights.time)],
          [this.time, 'Digging for Spiritual Gems (10 min.)', null, this.getAssigneeName(gems), this.addTime(gems.time)],
          [this.time, this.getAssignmentTitle(bibleReading), null, this.getAssigneeName(bibleReading), this.addTime(bibleReading.time)]
        ]))
        stack.push(this.createSubheader('APPLY YOURSELF TO THE FIELD MINISTRY', COLORS.MINISTRY))
        stack.push(this.createTable(COLORS.MINISTRY, [
          null,
          null,
          null,
          null
        ]))
        stack.push(this.createSubheader('LIVING AS CHRISTIANS', COLORS.LIVING))
        const livingTableRows = [
          [this.time, songs[1], null, null, this.addTime(5)],
          [this.time, this.getAssignmentTitle(serviceTalk1), null, this.getAssigneeName(serviceTalk1), this.addTime(serviceTalk1.time)],
          null
        ]
        if (serviceTalk2) livingTableRows[2] = [this.time, this.getAssignmentTitle(serviceTalk2), null, this.getAssigneeName(serviceTalk2), this.addTime(serviceTalk2.time)]
        livingTableRows.push(
          [this.time, 'Congregation Bible Study (30 min.)', 'Conductor:', this.getAssigneeName(congregationBibleStudy), this.addTime(30)],
          [null, congregationBibleStudy.title, 'Reader:', this.getAssigneeName(reader), null],
          [this.time, 'Review/Preview/Announcements (3 min.)', 'Chairman:', this.getAssigneeName(chairman), this.addTime(3)],
          [this.time, songs[2], 'Prayer:', this.getAssigneeName(closingPrayer), this.addTime(5)]
        )
        const livingTable = this.createTable(COLORS.LIVING, livingTableRows)
        Object.assign(livingTable.table.body[3][1], { rowSpan: 2 })
        stack.push(livingTable)
        stack.push(this.createSeparator())
      })

      this.pdf = pdfMake.createPdf(docDefinition)
    },

    createSubheader (text, fillColor) {
      return {
        margin: [-8, 0],
        layout: 'noBorders',
        table: {
          widths: [350],
          body: [
            [{ margin: [12, 0], color: 'white', text, fillColor, bold: true }]
          ]
        }
      }
    },

    createSeparator (pageStart) {
      return {
        id: pageStart ? 'PageStartSeparator' : null,
        margin: [0, 0, 0, 8],
        stack: [
          { canvas: [{ type: 'line', x1: -8, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
          { canvas: [{ type: 'line', x1: -8, y1: 3, x2: 515, y2: 3, lineWidth: 1 }] }
        ]
      }
    },

    createTable (markerColor, rows) {
      const body = []
      for (const row of rows) {
        const bodyRow = []
        body.push(bodyRow)
        if (!row) {
          bodyRow.push({ text: '', colSpan: 6 })
          continue
        }
        const [timeOn, title, assigneeTitle, assigneeName, timeOff] = row
        bodyRow.push(
          { text: timeOn },
          { text: '•', fontSize: 24, color: markerColor, margin: [0, -8] },
          { text: title, paddingLeft: 0 },
          { text: assigneeTitle, fontSize: 8, color: '#6F6F6F', alignment: 'right', margin: [0, 1, 0, 0] },
          { text: assigneeName },
          { text: timeOff, alignment: 'right' }
        )
      }
      return {
        margin: [0, 2, 0, 8],
        layout: {
          defaultBorder: false,
          fillColor: (rowIndex, node, columnIndex) => rowIndex % 2 === 1 && columnIndex > 1 ? '#DEDEDE' : null,
          paddingLeft: columnIndex => columnIndex === 2 ? 0 : 2,
          paddingTop: () => 1,
          paddingBottom: () => 1
        },
        table: {
          widths: [20, 6, '*', 36, 72, 20],
          body
        }
      }
    }
  }
}
</script>

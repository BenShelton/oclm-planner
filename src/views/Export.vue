<template>
  <VLayout column>
    <p>Select a month/year below and click the buttons to generate a schedule.</p>
    <VLayout wrap shrink justify-center>
      <VSelect
        v-model="month"
        class="mx-4"
        label="Month"
        :items="months"
      />
      <VSelect
        v-model="year"
        class="mx-4"
        label="Year"
        :items="years"
      />
    </VLayout>
    <VLayout wrap class="px-3">
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
      pdf: null,
      showPreview: false,
      generationError: false
    }
  },

  methods: {
    previewSchedule () {
      this.showPreview = true
      Promise.resolve([1, 2, 3, 4, 5])
        .then(this.generateSchedule)
        .catch(err => {
          this.generationError = true
          console.error(err)
        })
    },
    generateSchedule (weeks) {
      const stack = []
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [36, 100, 36, 72],
        pageBreakBefore: ({ id, pageNumbers }) => id === 'PageStartSeparator' && !(pageNumbers.includes(1)),
        header: {
          margin: [44, 36],
          stack: [
            { text: 'S-140-EN 12/17', margin: [0, 0, 0, 30] },
            {
              columns: [
                { text: 'CANTON CONGREGATION', width: 160, margin: [0, 4, 0, 0], bold: true },
                { text: 'Our Christian Life & Ministry Schedule', alignment: 'right', fontSize: 17, bold: true }
              ]
            }
          ]
        },
        footer (currentPage) {
          const startingWeek = currentPage * 2 - 1
          const text = startingWeek === weeks.length ? `WEEK ${startingWeek}` : `WEEKS ${startingWeek} & ${startingWeek + 1}`
          return { text, margin: [44, 36], alignment: 'right', bold: true }
        },
        content: [
          { margin: [8, 0], stack }
        ]
      }

      weeks.forEach((week, index) => {
        if (index % 2 === 0) stack.push(this.createSeparator(true))
        stack.push({
          text: '7 Jan | WEEKLY BIBLE READING: ACTS 21-22',
          fontSize: 14,
          bold: true
        })
        stack.push({ text: 'Time Off', bold: true, decoration: 'underline', alignment: 'right' })
        stack.push(this.createTable(COLORS.TREASURES, [
          ['7:00', 'Song 96', 'Prayer:', 'Ben Jones', '7:05'],
          ['7:05', 'Opening Comments', 'Chairman:', 'Other Brother', '7:08']
        ]))
        stack.push(this.createSubheader('TREASURES FROM GOD\'S WORD', COLORS.TREASURES))
        stack.push(this.createTable(COLORS.MINISTRY, [
          ['7:08', 'Song 96', 'Prayer:', 'Ben Jones', '7:05'],
          ['7:05', 'Opening Comments', 'Chairman:', 'Other Brother', '7:08']
        ]))
        stack.push(this.createSubheader('APPLY YOURSELF TO THE FIELD MINISTRY', COLORS.MINISTRY))
        stack.push(this.createTable(COLORS.LIVING, [
          ['7:08', 'Song 96', 'Prayer:', 'Ben Jones', '7:05'],
          ['7:05', 'Opening Comments', 'Chairman:', 'Other Brother', '7:08']
        ]))
        stack.push(this.createSubheader('LIVING AS CHRISTIANS', COLORS.LIVING))
        stack.push(this.createTable(COLORS.LIVING, [
          ['7:08', 'Song 96', 'Prayer:', 'Ben Jones', '7:05'],
          ['7:05', 'Opening Comments', 'Chairman:', 'Other Brother', '7:08']
        ]))
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
            [{ margin: [12, 0], color: 'white', text, fillColor }]
          ]
        }
      }
    },

    createSeparator (pageStart) {
      return {
        id: pageStart ? 'PageStartSeparator' : null,
        margin: [0, 8],
        stack: [
          { canvas: [{ type: 'line', x1: -8, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
          { canvas: [{ type: 'line', x1: -8, y1: 3, x2: 515, y2: 3, lineWidth: 1 }] }
        ]
      }
    },

    createTable (markerColor, rows) {
      const body = []
      for (const row of rows) {
        const [timeOn, title, assigneeTitle, assigneeName, timeOff] = row
        body.push([
          timeOn,
          { markerColor, ul: [title] },
          { text: assigneeTitle, fontSize: 10, color: '#999999', alignment: 'right', margin: [0, 1, 0, 0] },
          assigneeName,
          { text: timeOff, alignment: 'right' }
        ])
      }
      return {
        margin: [0, 8],
        layout: {
          defaultBorder: false,
          fillColor: (rowIndex, node, columnIndex) => rowIndex % 2 === 1 ? '#CCCCCC' : null
        },
        table: {
          widths: [36, '*', 48, 96, 36],
          body
        }
      }
    }
  }
}
</script>

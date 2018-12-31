<template>
  <VLayout column fill-height>
    <p>Coming soon...</p>
    <VBtn @click="generatePDF">
      Generate
    </VBtn>
    <iframe ref="pdfPreview" :style="{ height: '100%' }" />
  </VLayout>
</template>

<script>
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

import { COLORS } from '@/constants'

pdfMake.vfs = pdfFonts.pdfMake.vfs

export default {
  name: 'Export',

  mounted () {
    this.generatePDF()
  },

  data () {
    return {
      month: ''
    }
  },

  methods: {
    generatePDF () {
      const indentMargin = [8, 0]
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [36, 124, 36, 36],
        header: {
          margin: 36,
          stack: [
            {
              text: 'S-140-EN 12/17',
              margin: [8, 0, 0, 30]
            },
            {
              columns: [
                {
                  text: 'CANTON CONGREGATION',
                  width: 160,
                  margin: [8, 4, 0, 0],
                  bold: true
                },
                {
                  text: 'Our Christian Life & Ministry Schedule',
                  alignment: 'right',
                  fontSize: 17,
                  bold: true
                }
              ]
            },
            {
              margin: [0, 8, 0, 0],
              table: {
                widths: ['*'],
                body: [
                  [{ fillColor: '#333333', text: '' }]
                ]
              }
            }
          ]
        },
        content: [
          {
            margin: indentMargin,
            text: '7 Jan | WEEKLY BIBLE READING: ACTS 21-22',
            fontSize: 14,
            bold: true
          },
          {
            margin: indentMargin,
            text: 'Time Off',
            bold: true,
            decoration: 'underline',
            alignment: 'right'
          },
          {
            margin: indentMargin,
            table: {
              widths: [36, '*', 36, 48, 36],
              body: [
                [
                  '7:00',
                  [{ text: '•', color: COLORS.TREASURES }, 'Song 96']
                ]
              ]
            }
          }
        ]
      }
      pdfMake.createPdf(docDefinition).getDataUrl(dataUrl => {
        const previewFrame = this.$refs.pdfPreview
        previewFrame.src = dataUrl
      })
    }
  }
}
</script>

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
pdfMake.vfs = pdfFonts.pdfMake.vfs

export default {
  name: 'Export',

  data () {
    return {
      month: ''
    }
  },

  methods: {
    generatePDF () {
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: 40,
        header: [
          {
            margin: [40, 12, 12, 0],
            columns: [
              {
                text: 'Canton Congregation',
                fontSize: 13
              },
              {
                text: 'Our Christian Life & Ministry Schedule',
                alignment: 'right',
                fontSize: 24
              }
            ]
          },
          {
            margin: [12, 0],
            table: {
              widths: ['*'],
              body: [
                [{ fillColor: '#333333', text: '' }]
              ]
            }
          }
        ],
        content: [
          {
            text: '7 Jan | WEEKLY BIBLE READING: ACTS 21-22',
            fontSize: 14
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

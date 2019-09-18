<template>
  <v-layout column>
    <p class="subheading text-xs-center mt-4 mb-5">
      Select a month/year below and click the buttons to generate a PDF
    </p>
    <v-layout wrap shrink justify-center>
      <v-flex xs12 sm6 md4>
        <v-select
          v-model="month"
          outline
          class="mx-4"
          label="Month"
          :items="months"
        />
      </v-flex>
      <v-flex xs12 sm6 md4>
        <v-select
          v-model="year"
          outline
          class="mx-4"
          label="Year"
          :items="years"
        />
      </v-flex>
    </v-layout>
    <v-layout column align-center class="mt-3 px-3">
      <v-btn large color="primary" @click="previewSchedule">
        Preview Schedule
        <v-icon right dark>
          find_in_page
        </v-icon>
      </v-btn>
      <v-btn large color="primary" @click="previewAssignmentSlips">
        Preview Assignment Slips
        <v-icon right dark>
          find_in_page
        </v-icon>
      </v-btn>
    </v-layout>
    <PDFPreview
      v-model="showPreview"
      :pdf="pdf"
      :error="generationError"
    />
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { generateSchedule, generateAssignmentSlips } from '@/plugins/pdfMake'

import PDFPreview from '@/components/PDFPreview.vue'
import { scheduleModule } from '../store'

interface Month {
  text: string
  value: string
}

@Component({
  components: {
    PDFPreview
  }
})
export default class Export extends Vue {
  // Data
  month: string = (new Date().getMonth() + 1).toString().padStart(2, '0')
  months: Month[] = [
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
  ]
  year: string = new Date().getFullYear().toString()
  years: string[] = ['2019']
  pdf: any = null
  showPreview: boolean = false
  generationError: boolean = false

  // Methods
  previewPDF (generator): Promise<void> {
    this.generationError = false
    this.pdf = null
    this.showPreview = true
    const month = this.year + '-' + this.month
    return scheduleModule.loadMonth({ month })
      .then(weeks => generator(weeks, month))
      .then(pdf => { this.pdf = pdf })
      .catch(err => {
        this.generationError = true
        console.error(err)
      })
  }

  previewSchedule (): void {
    this.previewPDF(generateSchedule)
  }

  previewAssignmentSlips (): void {
    this.previewPDF(generateAssignmentSlips)
  }
}
</script>

<template>
  <v-dialog v-model="dialog" content-class="fill-height">
    <v-layout column fill-height class="pa-4 white">
      <v-flex shrink>
        <v-layout align-center wrap>
          <p class="headline ma-0">
            Preview
          </p>
          <v-spacer />
          <v-btn
            color="primary"
            :disabled="!downloadSrc"
            :href="downloadSrc"
            :download="downloadTitle"
            @click="onDownload"
          >
            Download
            <v-icon right dark>
              cloud_download
            </v-icon>
          </v-btn>
          <v-btn icon @click="onClose">
            <v-icon>close</v-icon>
          </v-btn>
        </v-layout>
      </v-flex>

      <v-layout v-if="error" column align-center>
        <v-icon large color="error" class="py-5">
          warning
        </v-icon>
        <p class="error--text">
          This month could not be fully loaded, please check that all weeks have been filled in on the schedule
        </p>
      </v-layout>
      <v-layout v-else-if="!src" column align-center>
        <v-progress-circular indeterminate color="primary" class="py-5" />
        <p>Generating schedule, please wait...</p>
      </v-layout>
      <v-layout
        v-else
        fill-height
        wrap
        class="object-wrapper my-3 elevation-1"
      >
        <v-flex
          v-for="i in numPages"
          :key="i"
          xs12
          md6
        >
          <PDF :src="src" :page="i" />
        </v-flex>
      </v-layout>
    </v-layout>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator'
import PDF from 'vue-pdf'

import { TCreatedPdf } from 'pdfmake/build/pdfmake'

interface IPDFWithDefinition extends TCreatedPdf {
  docDefinition: {
    info: {
      title?: string
    }
  }
}
type PropPDF = IPDFWithDefinition | null

@Component({
  components: { PDF }
})
export default class PDFPreview extends Vue {
  // Props
  @Prop({ type: Boolean, required: true }) readonly value!: boolean
  @Prop({ type: Object, default: null }) readonly pdf!: PropPDF
  @Prop({ type: Boolean, required: true }) readonly error!: boolean

  // Data
  src: ReturnType<typeof PDF.createLoadingTask> | null = null
  downloadBlob: object | null = null
  downloadSrc: string | null = null
  numPages: number = 0

  // Computed
  get dialog (): boolean {
    return this.value
  }
  set dialog (val) {
    if (!val) this.onClose()
  }

  get downloadTitle () {
    if (!this.pdf) return ''
    return this.pdf.docDefinition.info.title + '.pdf'
  }

  // Watchers
  @Watch('pdf')
  onPdfChanged (val: PropPDF) {
    if (!val) {
      this.src = null
      this.downloadBlob = null
      this.downloadSrc = null
      return
    }
    val.getBlob((blob: object) => {
      this.downloadBlob = blob
      const dataUrl = URL.createObjectURL(blob)
      this.downloadSrc = dataUrl
      this.src = PDF.createLoadingTask(dataUrl)
      this.src.then(pdf => { this.numPages = pdf.numPages })
    })
  }

  // Methods
  onDownload (): void {
    // fallback for Edge/IE, which refuse to download a dataURI link
    if (navigator && navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(this.downloadBlob, this.downloadTitle)
    }
  }

  @Emit('input')
  onClose (): boolean {
    return false
  }
}
</script>

<style lang="stylus" scoped>
.object-wrapper
  overflow scroll
</style>

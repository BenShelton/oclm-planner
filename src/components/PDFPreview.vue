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

<script>
import PDF from 'vue-pdf'

export default {
  name: 'PDFPreview',

  components: { PDF },

  props: {
    value: { type: Boolean, required: true },
    pdf: { type: Object, default: null },
    error: { type: Boolean, required: true }
  },

  data () {
    return {
      src: null,
      downloadBlob: null,
      downloadSrc: null,
      numPages: 0
    }
  },

  computed: {
    dialog: {
      get () {
        return this.value
      },
      set (val) {
        if (!val) this.onClose()
      }
    },
    downloadTitle () {
      if (!this.pdf) return ''
      return this.pdf.docDefinition.info.title + '.pdf'
    }
  },

  watch: {
    pdf (val) {
      if (!val) {
        this.src = null
        this.downloadBlob = null
        this.downloadSrc = null
        return
      }
      val.getBlob(blob => {
        this.downloadBlob = blob
        const dataUrl = URL.createObjectURL(blob)
        this.downloadSrc = dataUrl
        this.src = PDF.createLoadingTask(dataUrl)
        this.src.then(pdf => { this.numPages = pdf.numPages })
      })
    }
  },

  methods: {
    onDownload () {
      // fallback for Edge/IE, which refuse to download a dataURI link
      if (navigator && navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(this.downloadBlob, this.downloadTitle)
      }
    },
    onClose () {
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="stylus" scoped>
.object-wrapper
  overflow scroll
</style>

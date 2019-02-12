<template>
  <VDialog v-model="dialog" content-class="fill-height">
    <VLayout column fill-height class="pa-4 white">
      <VFlex shrink>
        <VLayout align-center wrap>
          <p class="headline ma-0">
            Preview
          </p>
          <VSpacer />
          <VBtn
            color="primary"
            :disabled="!downloadSrc"
            :href="downloadSrc"
            :download="downloadTitle"
          >
            Download
            <VIcon right dark>
              cloud_download
            </VIcon>
          </VBtn>
          <VBtn icon @click="onClose">
            <VIcon>close</VIcon>
          </VBtn>
        </VLayout>
      </VFlex>

      <VLayout v-if="error" column align-center>
        <VIcon large color="error" class="py-5">
          warning
        </VIcon>
        <p class="error--text">
          This month could not be fully loaded, please check that all weeks have been filled in on the schedule
        </p>
      </VLayout>
      <VLayout v-else-if="!src" column align-center>
        <VProgressCircular indeterminate color="primary" class="py-5" />
        <p>Generating schedule, please wait...</p>
      </VLayout>
      <VLayout
        v-else
        fill-height
        wrap
        class="object-wrapper my-3 elevation-1"
      >
        <VFlex
          v-for="i in numPages"
          :key="i"
          xs12
          md6
        >
          <PDF :src="src" :page="i" />
        </VFlex>
      </VLayout>
    </VLayout>
  </VDialog>
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
        this.downloadSrc = null
        return
      }
      val.getBlob(blob => {
        const dataUrl = URL.createObjectURL(blob)
        this.downloadSrc = dataUrl
        this.src = PDF.createLoadingTask(dataUrl)
        this.src.then(pdf => { this.numPages = pdf.numPages })
      })
    }
  },

  methods: {
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

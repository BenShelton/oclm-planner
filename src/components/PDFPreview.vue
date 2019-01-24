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
            :disabled="!dataUrl"
            :href="dataUrl"
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
      <VLayout v-else-if="!dataUrl" column align-center>
        <VProgressCircular indeterminate color="primary" class="py-5" />
        <p>Generating schedule, please wait...</p>
      </VLayout>
      <VLayout v-else fill-height class="object-wrapper my-3 elevation-1">
        <object :data="dataUrl" />
      </VLayout>
    </VLayout>
  </VDialog>
</template>

<script>
export default {
  name: 'PDFPreview',

  props: {
    value: { type: Boolean, required: true },
    pdf: { type: Object, default: null },
    error: { type: Boolean, required: true }
  },

  data () {
    return {
      dataUrl: null
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
      return this.pdf.docDefinition.info.title
    }
  },

  watch: {
    pdf (val) {
      if (!val) {
        this.dataUrl = null
        return
      }
      val.getDataUrl(dataUrl => { this.dataUrl = dataUrl })
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
object
  width 100%
  min-height 100%
</style>

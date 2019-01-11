<template>
  <VDialog v-model="value" persistent fullscreen>
    <VLayout column fill-height class="pa-4 white">
      <VFlex shrink>
        <p class="headline">
          Preview
        </p>
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
      <iframe v-else :src="dataUrl" class="my-3" />

      <VFlex shrink>
        <VLayout justify-end>
          <VBtn @click="onClose">
            Close
          </VBtn>
        </VLayout>
      </VFlex>
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
iframe
  height 100%
</style>

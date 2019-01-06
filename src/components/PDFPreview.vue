<template>
  <VDialog v-model="value" persistent fullscreen>
    <VLayout column fill-height class="pa-4 white">
      <p class="headline">
        Preview
      </p>
      <iframe :src="dataUrl" class="my-3" />
      <VLayout justify-end>
        <VBtn @click="onClose">
          Close
        </VBtn>
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

  watch: {
    pdf (val) {
      if (!val) return
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

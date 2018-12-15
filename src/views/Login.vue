<template>
  <VLayout fill-height align-center justify-center>
    <VCard width="400" class="pa-4">
      <VCardTitle>
        <h1>Login</h1>
      </VCardTitle>
      <VCardText>
        <VTextField
          v-model="password"
          outline
          label="Password"
          :type="visible ? 'text' : 'password'"
          :append-icon="visible ? 'visibility_off' : 'visibility'"
          @click:append="toggleVisible"
        />
      </VCardText>
      <VCardActions>
        <VBtn
          color="primary"
          :disabled="disabled"
          :loading="loading"
          @click="onLogin"
        >
          Login
        </VBtn>
      </VCardActions>
    </VCard>
  </VLayout>
</template>

<script>
export default {
  name: 'Login',

  data () {
    return {
      password: '',
      visible: false,
      loading: false
    }
  },

  computed: {
    disabled () {
      return this.loading || !this.password
    }
  },

  methods: {
    toggleVisible () {
      this.visible = !this.visible
    },
    onLogin () {
      if (!this.password) {

      }
      this.loading = true
    }
  }
}
</script>

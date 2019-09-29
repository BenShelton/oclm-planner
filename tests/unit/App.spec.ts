import { shallowMount } from '@vue/test-utils'

import App from '@/App.vue'

describe('App', () => {
  function mountApp () {
    return shallowMount(App, {
      stubs: [
        'router-view',
        'v-app',
        'v-content',
        'v-container',
        'v-footer'
      ]
    })
  }

  it('should have the name "App"', () => {
    expect(mountApp().name()).toBe('App')
  })
})

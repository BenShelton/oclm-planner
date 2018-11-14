import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'

import App from '@/App.vue'

describe('App', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(App, {
      stubs: [
        'router-view',
        'v-app',
        'v-content',
        'v-container',
        'v-footer'
      ]
    })
  })

  it('has the name "App"', () => {
    expect(wrapper.name()).to.equal('App')
  })
})

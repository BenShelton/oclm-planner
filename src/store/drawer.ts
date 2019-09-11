import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import store from './index'

@Module({
  store,
  dynamic: true,
  namespaced: true,
  name: 'drawer'
})
export default class Drawer extends VuexModule {
  // State
  open: boolean = false

  // Mutations
  @Mutation
  SET_OPEN (open: boolean) {
    this.open = open
  }

  @Mutation
  TOGGLE_OPEN () {
    this.open = !this.open
  }
}

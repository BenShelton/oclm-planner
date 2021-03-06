import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({ namespaced: true, name: 'drawer' })
export default class Drawer extends VuexModule {
  // State
  open: boolean = false

  // Mutations
  @Mutation
  SET_OPEN (open: boolean): void {
    this.open = open
  }

  @Mutation
  TOGGLE_OPEN (): void {
    this.open = !this.open
  }
}

import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({ namespaced: true, name: 'alert' })
export default class Alert extends VuexModule {
  // State
  text: string = ''
  color: string = ''
  visible: boolean = false

  // Mutations
  @Mutation
  UPDATE_ALERT ({ text, color = 'primary', visible = true }: { text: string, color?: string, visible?: boolean }): void {
    Object.assign(this, { text, color, visible })
  }

  @Mutation
  UPDATE_VISIBILITY (payload: boolean): void {
    this.visible = payload
  }

  @Mutation
  CLEAR_ALERT (): void {
    this.text = ''
    this.color = ''
    this.visible = false
  }
}

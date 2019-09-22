declare module 'vue-pdf' {
  import Vue from 'vue'
  interface IPDF {
    numPages: number
  }
  export default class extends Vue {
    static createLoadingTask (dataUrl: string): Promise<IPDF>
  }
}

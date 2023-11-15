declare module '*.vue' {
  import type { DefineComponent } from 'vue-demi'
  import { App, defineComponent } from 'vue-demi'
  const component: ReturnType<typeof defineComponent> & {
    install(app: App): void
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

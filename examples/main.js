import { createApp } from 'vue-demi'
import App from './App.vue'
import router from './router'
import './css/iconfont.css'

import ContextMenu from '../src/ContextMenuInstance'

createApp(App)
  .use(router)
  .use(ContextMenu)
  .mount('#app')

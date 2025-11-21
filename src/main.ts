import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Import app css
import './css/app.scss'

// Import critical override CSS (MUST be last)
import './css/quasar-override.css'

// Import visual enhancements
import './css/visual-enhancements.css'

// IMPORTANTE: Import background force ÚLTIMO para override total
import './css/background-force.css'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'
import router from './router'

const myApp = createApp(App)

myApp.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  }
})

myApp.use(router)

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount('#app')
import Vue from 'vue'
import App from './App.vue'

//require('dotenv').config()

Vue.config.productionTip = false
window.imgTag=""
window.textScreen=0

new Vue({
  render: h => h(App),
}).$mount('#app')

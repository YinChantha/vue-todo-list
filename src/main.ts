import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Icon } from '@iconify/vue'
import VueWriter from "vue-writer";

const app = createApp(App);
app.component('Icon', Icon)
app.use(VueWriter);
app.mount('#app');

import { createApp } from 'vue';
import App from './App.vue';
import DebounceThrottle from '../plugin/index.js';
import './style.css';

createApp(App)
  .use(DebounceThrottle, { debounceWait: 300, throttleWait: 200 })
  .mount('#app');

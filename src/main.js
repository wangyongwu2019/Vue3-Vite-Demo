import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';
import DebounceThrottle from '../plugin/index.js';
import './style.css';

createApp(App)
  .use(DebounceThrottle, { debounceWait: 300, throttleWait: 200 })
  .use(router)
  .mount('#app');

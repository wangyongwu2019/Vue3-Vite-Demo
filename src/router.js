import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import DeployGuide from './views/DeployGuide.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/deploy', name: 'deploy', component: DeployGuide }
  ]
});

export default router;

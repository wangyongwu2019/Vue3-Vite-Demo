<script setup>
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <router-link to="/" class="brand">⚡ debounce-throttle</router-link>
      <router-link to="/deploy" class="deploy-btn">🚀 部署方案</router-link>
    </header>
    <router-view />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 22px;
  background: rgba(15, 20, 32, 0.82);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.brand {
  color: var(--text);
  font-weight: 600;
  text-decoration: none;
  font-size: 15px;
}
.brand:hover { color: var(--accent); }
.deploy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f8cff, #7a5cff);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(79, 140, 255, 0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}
.deploy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 140, 255, 0.5);
}
</style>

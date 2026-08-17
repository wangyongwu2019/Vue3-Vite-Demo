<script setup>
import { ref } from 'vue';

const steps = [
  {
    n: 1,
    title: '本地电脑推送更新代码到远程仓库',
    desc: '在本地项目目录把改动提交并推送到 Git 远程仓库（GitHub / Gitee / 腾讯云 Coding 等）。',
    code: `cd D:\\DeepseekHarness\\debounce-throttle-vue
git status                 # 先看有哪些改动
git add .
git commit -m "feat: 新增腾讯云部署说明页"
git push origin main       # 若默认分支是 master，改为 git push origin master`,
    tip: '首次推送前先确认已关联远程：git remote -v；没有则 git remote add origin <仓库地址>。'
  },
  {
    n: 2,
    title: '云服务器进入项目目录，拉取最新代码',
    desc: 'SSH 登录腾讯云服务器，进入部署目录执行 git pull。',
    code: `ssh root@你的服务器公网IP
cd ~/Vue3-Vite-Demo
git pull origin main`,
    tip: '首次部署还没克隆过仓库时：git clone <仓库地址> /var/www/debounce-throttle-vue。若服务器上有未提交改动导致冲突，可用 git reset --hard origin/main 强制对齐（会丢弃服务器上未提交改动，慎用）。'
  },
  {
    n: 3,
    title: '有更新依赖时重新安装',
    desc: '当 package.json / package-lock.json 有变化（比如这次新增了 vue-router）时才需要，否则可跳过。',
    code: `npm install    # 按 package.json 安装
# 推荐用 npm ci：严格按照 package-lock.json 安装，更稳定
npm ci`,
    tip: '日常只改了源码、没改依赖时，可跳过本步，直接执行 npm run build。'
  },
  {
    n: 4,
    title: '执行 npm run build 打包',
    desc: 'Vite 会把项目打包成纯静态文件，输出到 dist/ 目录。',
    code: `npm run build
ls dist        # 确认 index.html 和 assets/ 已生成`,
    tip: '打包产物就是 nginx 要托管的目录，路径在本例中是 /var/www/debounce-throttle-vue/dist。'
  },
  {
    n: 5,
    title: '刷新浏览器地址',
    desc: 'nginx 已经指向 dist 目录，直接刷新即可看到最新页面。',
    code: `浏览器访问：http://你的域名或公网IP/
强制刷新（清缓存）：Ctrl + F5`,
    tip: '本项目的 /deploy 页面用了 Vue Router 的 history 模式，刷新子路由能正常打开，前提是第 6 步的 nginx 已配置 try_files 回退。'
  },
  {
    n: 6,
    title: 'nginx 配置一键覆盖（免 vim）',
    desc: '用 cat > 文件 << \'EOF\' 把完整配置一次性写入，避免用 vim 手工编辑。',
    code: `cat > /etc/nginx/conf.d/debounce-throttle-vue.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.com;   # 改成你的域名或公网 IP

    root /var/www/debounce-throttle-vue/dist;
    index index.html;

    # Vue Router history 模式关键：所有路径回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \\.(js|css|png|jpg|svg|woff2?|ico)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
}
EOF`,
    tip: 'heredoc 的 EOF 用单引号 \'EOF\' 包住，shell 就不会把 $uri 当变量展开；写入后可直接覆盖同名文件，无需进 vim。'
  },
  {
    n: 7,
    title: '检测 nginx 语法配置',
    desc: '每次改完 nginx 配置，先用 nginx -t 自检语法，通过后再重载。',
    code: `nginx -t`,
    tip: '看到 "syntax is ok" 和 "test is successful" 即表示配置正确；报错会指出具体行号。'
  },
  {
    n: 8,
    title: '重启 nginx',
    desc: '语法通过后重载 nginx 让配置生效。',
    code: `systemctl reload nginx     # 平滑重载（推荐，不中断现有连接）
# 或
systemctl restart nginx    # 完全重启
# 非 systemd 环境：
nginx -s reload`,
    tip: 'reload 与 restart 的区别：reload 平滑更新配置，restart 会短暂中断服务；日常更新用 reload 即可。'
  }
];

const oneKeyScript = `#!/usr/bin/env bash
# 保存为 /var/www/debounce-throttle-vue/deploy.sh，之后一条命令完成部署
set -e
cd /var/www/debounce-throttle-vue
git pull origin main
npm ci
npm run build
nginx -t && systemctl reload nginx
echo "✅ 部署完成：刷新浏览器查看最新页面"`;

const cautions = [
  { t: '腾讯云安全组放行 80 端口', d: '控制台 → 实例 → 安全组 → 入站规则，添加 TCP:80（若用 HTTPS 再放行 443），否则公网访问不通。' },
  { t: '域名解析与备案', d: '用域名时先在 DNS 把域名解析到服务器公网 IP；中国大陆服务器还需完成 ICP 备案。' },
  { t: 'HTTPS 证书', d: '生产环境建议用 443 + 证书（可申请腾讯云免费 SSL 证书，或用 certbot 自动签发）。' },
  { t: 'history 模式依赖 try_files', d: '本项目的 /deploy 路由是 history 模式，nginx 必须配 try_files $uri $uri/ /index.html，否则刷新子页面会 404。' }
];

const copied = ref('');

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = text;
    setTimeout(() => { if (copied.value === text) copied.value = ''; }, 1500);
  } catch (e) {
    /* 非 https 环境剪贴板可能被禁，降级为提示手动复制 */
    alert('复制失败，请手动选中复制');
  }
}
</script>

<template>
  <div class="page">
    <h1>🚀 腾讯云服务器部署方案</h1>
    <p class="sub">debounce-throttle-vue · 8 步从本地推到线上</p>

    <div class="flow">
      <span>① 本地推送</span><i>→</i><span>② 服务器拉取</span><i>→</i><span>③ 装依赖</span><i>→</i><span>④ 打包</span><i>→</i><span>⑤ 刷新</span><i>→</i><span>⑥ nginx 配置</span><i>→</i><span>⑦ 语法检测</span><i>→</i><span>⑧ 重启 nginx</span>
    </div>

    <section v-for="s in steps" :key="s.n" class="card">
      <h2>{{ s.n }}. {{ s.title }}</h2>
      <p class="desc">{{ s.desc }}</p>
      <div class="code-wrap">
        <button class="copy" @click="copy(s.code)">{{ copied === s.code ? '✓ 已复制' : '复制' }}</button>
        <pre><code>{{ s.code }}</code></pre>
      </div>
      <p v-if="s.tip" class="tip">💡 {{ s.tip }}</p>
    </section>

    <section class="card">
      <h2>🎁 附：一键部署脚本</h2>
      <p class="desc">把下面脚本保存到服务器项目目录下，以后每次部署只需执行 ./deploy.sh。</p>
      <div class="code-wrap">
        <button class="copy" @click="copy(oneKeyScript)">{{ copied === oneKeyScript ? '✓ 已复制' : '复制' }}</button>
        <pre><code>{{ oneKeyScript }}</code></pre>
      </div>
      <p class="tip">💡 赋执行权限：chmod +x deploy.sh</p>
    </section>

    <section class="card">
      <h2>⚠️ 腾讯云注意事项</h2>
      <ul class="cautions">
        <li v-for="c in cautions" :key="c.t">
          <strong>{{ c.t }}</strong> —— {{ c.d }}
        </li>
      </ul>
    </section>

    <footer>
      <router-link to="/">← 返回演示首页</router-link>
    </footer>
  </div>
</template>

<style scoped>
.flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 18px;
}
.flow span {
  color: var(--accent);
  font-weight: 500;
}
.flow i { font-style: normal; color: var(--muted); }
.desc { color: var(--muted); margin: 4px 0 12px; }
.tip {
  color: var(--amber);
  font-size: 13px;
  margin: 10px 0 0;
}
.code-wrap {
  position: relative;
}
.copy {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--panel2);
  color: var(--text);
  cursor: pointer;
}
.copy:hover { border-color: var(--accent); }
pre {
  margin: 0;
  background: #0c1020;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  overflow-x: auto;
}
pre code {
  font: 13px/1.7 ui-monospace, Menlo, Consolas, "Courier New", monospace;
  color: #cfe3ff;
  white-space: pre;
}
.cautions { padding-left: 18px; margin: 8px 0 0; color: var(--muted); }
.cautions li { margin: 8px 0; }
.cautions strong { color: var(--text); }
footer { text-align: center; margin-top: 26px; }
footer a { color: var(--accent); }
</style>

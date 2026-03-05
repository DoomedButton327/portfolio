/* ============================================================
   DoomedButton327 — Portfolio App
   GitHub API · Code Viewer · Canvas · Animations
   ============================================================ */

'use strict';

// ── Config ──────────────────────────────────────────────────
const GITHUB_USER = 'DoomedButton327';
const API = `https://api.github.com`;

// Language → hex color (GitHub standard)
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#2b7489', Python:     '#3572A5',
  HTML:       '#e34c26', CSS:        '#563d7c', SCSS:       '#c6538c',
  Java:       '#b07219', 'C#':       '#178600', 'C++':      '#f34b7d',
  C:          '#555555', Ruby:       '#701516', Go:         '#00ADD8',
  Rust:       '#dea584', PHP:        '#4F5D95', Swift:      '#ffac45',
  Kotlin:     '#F18E33', Shell:      '#89e051', PowerShell: '#012456',
  Vue:        '#41b883', Svelte:     '#ff3e00', Dart:       '#00B4AB',
  Lua:        '#000080', R:          '#198CE7', Dockerfile: '#384d54',
  Makefile:   '#427819', Jupyter:    '#DA5B0B', Assembly:   '#6E4C13',
};

// Typewriter phrases
const PHRASES = [
  'Developer & Creator ✦',
  'Building things on GitHub',
  'Code. Design. Ship.',
  'Turning ideas into reality',
  'Exploring the digital frontier',
];

// ── State ────────────────────────────────────────────────────
let allRepos       = [];
let filteredRepos  = [];
let currentSort    = 'updated';
let currentLang    = 'all';
let currentRepoObj = null;
let currentFileRaw = '';

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initTypewriter();
  initScrollEffects();
  initNavScroll();
  initModal();
  initSearch();
  initSort();

  document.getElementById('footer-year').textContent = new Date().getFullYear();

  // Inject skeleton repo cards
  injectSkeletons(6);

  // Fetch data
  Promise.all([fetchUser(), fetchRepos()]).catch(console.error);
});

/* ============================================================
   STARFIELD CANVAS
   ============================================================ */
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, stars = [], shooters = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = Array.from({ length: 180 }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  function spawnShooter() {
    shooters.push({
      x: Math.random() * W * 0.7,
      y: Math.random() * H * 0.5,
      len: Math.random() * 120 + 60,
      speed: Math.random() * 8 + 6,
      alpha: 1,
      angle: Math.PI / 5 + (Math.random() - 0.5) * 0.4,
    });
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
      s.twinkle += 0.012;
      const a = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,170,255,${a})`;
      ctx.fill();
      s.y += s.speed * 0.08;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    });

    // Shooting stars
    shooters.forEach((sh, i) => {
      const dx = Math.cos(sh.angle) * sh.speed;
      const dy = Math.sin(sh.angle) * sh.speed;
      const grad = ctx.createLinearGradient(
        sh.x, sh.y,
        sh.x - dx * sh.len / sh.speed,
        sh.y - dy * sh.len / sh.speed
      );
      grad.addColorStop(0, `rgba(200,180,255,${sh.alpha})`);
      grad.addColorStop(1, 'rgba(200,180,255,0)');

      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - Math.cos(sh.angle) * sh.len, sh.y - Math.sin(sh.angle) * sh.len);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      sh.x += dx;
      sh.y += dy;
      sh.alpha -= 0.018;

      if (sh.alpha <= 0) shooters.splice(i, 1);
    });

    // Random shooting star trigger
    if (Math.random() < 0.003) spawnShooter();

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
}

/* ============================================================
   TYPEWRITER
   ============================================================ */
function initTypewriter() {
  const el    = document.getElementById('typewriter');
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = PHRASES[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 2200); return; }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % PHRASES.length; }
    }
    setTimeout(tick, deleting ? 40 : 75);
  }
  setTimeout(tick, 800);
}

/* ============================================================
   SCROLL EFFECTS
   ============================================================ */
function initScrollEffects() {
  const targets = document.querySelectorAll('.section-eyebrow, .section-title, .about-bio, .skills-card, .repos-controls');
  targets.forEach(el => el.classList.add('fade-up'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
}

function initNavScroll() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ============================================================
   GITHUB API — USER
   ============================================================ */
async function fetchUser() {
  try {
    const res  = await fetch(`${API}/users/${GITHUB_USER}`);
    if (!res.ok) throw new Error('User fetch failed');
    const data = await res.json();

    document.getElementById('stat-followers').textContent = fmtNum(data.followers);

    // Avatar
    const img = document.getElementById('user-avatar');
    img.src = data.avatar_url;
    img.onload  = () => img.classList.add('loaded');
    img.onerror = () => {};

    // Bio
    if (data.bio) {
      document.getElementById('bio-text').textContent = data.bio;
    }

    // Meta
    const meta = document.getElementById('bio-meta');
    const items = [];
    if (data.location) items.push({ icon: '📍', text: data.location });
    if (data.company)  items.push({ icon: '🏢', text: data.company });
    if (data.blog)     items.push({ icon: '🔗', text: data.blog, href: data.blog });
    if (data.twitter_username) items.push({ icon: '🐦', text: `@${data.twitter_username}` });
    meta.innerHTML = items.map(i =>
      `<span class="bio-meta-item">
        <span>${i.icon}</span>
        ${i.href ? `<a href="${i.href}" target="_blank" style="color:var(--blue-light)">${i.text}</a>` : `<span>${i.text}</span>`}
      </span>`
    ).join('');

  } catch (e) {
    console.warn('GitHub user fetch error:', e);
  }
}

/* ============================================================
   GITHUB API — REPOS
   ============================================================ */
async function fetchRepos() {
  try {
    const res = await fetch(`${API}/users/${GITHUB_USER}/repos?sort=updated&per_page=100`);
    if (!res.ok) throw new Error('Repos fetch failed');
    allRepos = await res.json();

    // Aggregate stars + forks + repo count
    let totalStars = 0, totalForks = 0;
    const langSet  = {};

    allRepos.forEach(r => {
      totalStars += r.stargazers_count || 0;
      totalForks += r.forks_count      || 0;
      if (r.language) langSet[r.language] = (langSet[r.language] || 0) + 1;
    });

    document.getElementById('stat-repos').textContent  = fmtNum(allRepos.length);
    document.getElementById('stat-stars').textContent  = fmtNum(totalStars);
    document.getElementById('stat-forks').textContent  = fmtNum(totalForks);

    buildSkillTags(langSet);
    buildLangFilters(langSet);
    applyFilter();

  } catch (e) {
    console.warn('GitHub repos fetch error:', e);
    document.getElementById('repos-grid').innerHTML =
      `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-3)">
        <div style="font-size:40px;margin-bottom:12px">⚠️</div>
        <p>Could not load repositories. This may be a GitHub API rate limit.</p>
        <a href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" style="color:var(--blue-light);margin-top:12px;display:inline-block">View on GitHub →</a>
       </div>`;
  }
}

/* ── Skills from detected languages ── */
function buildSkillTags(langSet) {
  const container = document.getElementById('skills-list');
  const sorted = Object.entries(langSet).sort((a, b) => b[1] - a[1]).slice(0, 14);

  if (!sorted.length) {
    container.innerHTML = '<span style="color:var(--text-3);font-size:13px">No languages detected yet.</span>';
    return;
  }

  container.innerHTML = sorted.map(([lang], i) => {
    const color = LANG_COLORS[lang] || '#8888aa';
    return `<span class="skill-tag" style="animation-delay:${i * 0.06}s">
      <span class="skill-dot" style="background:${color}"></span>
      ${esc(lang)}
    </span>`;
  }).join('');
}

/* ── Language filter buttons ── */
function buildLangFilters(langSet) {
  const container = document.getElementById('lang-filters');
  const top = Object.entries(langSet).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([l]) => l);

  top.forEach(lang => {
    const btn = document.createElement('button');
    btn.className   = 'lang-btn';
    btn.dataset.lang = lang;
    btn.innerHTML   = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${LANG_COLORS[lang] || '#888'};margin-right:5px"></span>${esc(lang)}`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = lang;
      applyFilter();
    });
    container.appendChild(btn);
  });

  // "All" button logic
  const allBtn = container.querySelector('[data-lang="all"]');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
      currentLang = 'all';
      applyFilter();
    });
  }
}

/* ── Search & Sort Init ── */
function initSearch() {
  const input = document.getElementById('repo-search');
  input.addEventListener('input', () => applyFilter());
}

function initSort() {
  const sel = document.getElementById('sort-select');
  sel.addEventListener('change', () => {
    currentSort = sel.value;
    applyFilter();
  });
}

/* ── Filter + Sort + Render ── */
function applyFilter() {
  const query = (document.getElementById('repo-search').value || '').toLowerCase().trim();

  filteredRepos = allRepos.filter(r => {
    const matchLang  = currentLang === 'all' || r.language === currentLang;
    const matchQuery = !query
      || (r.name        || '').toLowerCase().includes(query)
      || (r.description || '').toLowerCase().includes(query)
      || (r.topics      || []).some(t => t.toLowerCase().includes(query));
    return matchLang && matchQuery;
  });

  // Sort
  filteredRepos.sort((a, b) => {
    switch (currentSort) {
      case 'stars':   return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      case 'forks':   return (b.forks_count || 0)      - (a.forks_count || 0);
      case 'name':    return a.name.localeCompare(b.name);
      case 'updated': default:
        return new Date(b.updated_at) - new Date(a.updated_at);
    }
  });

  renderRepos();
}

/* ── Render Repo Cards ── */
function renderRepos() {
  const grid    = document.getElementById('repos-grid');
  const noRes   = document.getElementById('no-results');

  if (!filteredRepos.length) {
    grid.innerHTML = '';
    noRes.classList.remove('hidden');
    return;
  }
  noRes.classList.add('hidden');

  grid.innerHTML = filteredRepos.map((r, i) => repoCardHTML(r, i)).join('');

  // Attach click events
  grid.querySelectorAll('.repo-card').forEach(card => {
    const name = card.dataset.repo;
    card.addEventListener('click', () => {
      const repo = allRepos.find(r => r.name === name);
      if (repo) openCodeViewer(repo);
    });
  });
}

/* ── Card HTML ── */
function repoCardHTML(r, i) {
  const lang     = r.language || '';
  const color    = LANG_COLORS[lang] || '#8888aa';
  const desc     = r.description || '';
  const updated  = timeAgo(new Date(r.updated_at));
  const topics   = (r.topics || []).slice(0, 3);
  const emoji    = repoEmoji(r);

  return `
  <div class="repo-card" data-repo="${esc(r.name)}" style="animation-delay:${i * 0.05}s">
    <div class="repo-header">
      <div class="repo-icon">${emoji}</div>
      <span class="repo-name">${esc(r.name)}</span>
      ${r.private ? '<span class="repo-private-badge">Private</span>' : ''}
    </div>
    <p class="repo-desc ${!desc ? 'empty' : ''}">${esc(desc) || 'No description provided.'}</p>
    ${topics.length ? `<div class="repo-topics">${topics.map(t => `<span class="repo-topic">${esc(t)}</span>`).join('')}</div>` : ''}
    <div class="repo-footer">
      ${lang ? `<span class="repo-lang"><span class="lang-dot" style="background:${color}"></span>${esc(lang)}</span>` : '<span></span>'}
      <div class="repo-stats">
        <span class="repo-stat"><span class="icon">⭐</span>${r.stargazers_count}</span>
        <span class="repo-stat"><span class="icon">🍴</span>${r.forks_count}</span>
      </div>
      <span class="repo-updated">${updated}</span>
    </div>
    <div class="view-code-hint">⟨/⟩ View Code</div>
  </div>`;
}

/* ── Skeleton Loaders ── */
function injectSkeletons(count) {
  const grid = document.getElementById('repos-grid');
  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="repo-skel">
      <div class="skel-line title"></div>
      <div class="skel-line full"></div>
      <div class="skel-line medium"></div>
      <div class="skel-line short"></div>
    </div>`
  ).join('');
}

/* ============================================================
   CODE VIEWER MODAL
   ============================================================ */
function initModal() {
  const overlay  = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  const copyBtn  = document.getElementById('copy-btn');

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  copyBtn.addEventListener('click', () => {
    if (!currentFileRaw) return;
    navigator.clipboard.writeText(currentFileRaw).then(() => showToast());
  });
}

function openCodeViewer(repo) {
  currentRepoObj = repo;
  currentFileRaw = '';

  document.getElementById('modal-repo-name').textContent  = repo.name;
  document.getElementById('modal-repo-lang').textContent  = repo.language || 'Repo';
  document.getElementById('modal-gh-link').href           = repo.html_url;
  document.getElementById('code-filepath').textContent    = '← Select a file';
  document.getElementById('raw-link').href                = repo.html_url;
  document.getElementById('code-display').innerHTML       = `
    <div class="code-placeholder">
      <div class="placeholder-icon">📂</div>
      <p>Select a file from the explorer to view its contents</p>
    </div>`;

  // Reset file tree
  const treeEl = document.getElementById('file-tree');
  treeEl.innerHTML = `<div class="tree-loading"><div class="spin"></div> Loading files…</div>`;

  // Open modal
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  loadFileTree('', treeEl);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Load File Tree ── */
async function loadFileTree(path, container, depth = 0) {
  try {
    const url  = `${API}/repos/${GITHUB_USER}/${currentRepoObj.name}/contents/${path}`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error('Contents fetch failed');
    const items = await res.json();

    if (!Array.isArray(items)) {
      container.innerHTML = '<div class="tree-loading" style="color:var(--text-3)">Unable to load files.</div>';
      return;
    }

    // Sort: dirs first, then files
    items.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'dir' ? -1 : 1;
    });

    const ul = document.createElement('div');
    ul.className = depth === 0 ? '' : 'tree-children';

    items.forEach(item => {
      const row = document.createElement('div');
      row.className  = `tree-item ${item.type === 'dir' ? 'is-dir' : ''}`;
      row.style.paddingLeft = `${16 + depth * 12}px`;

      const icon = item.type === 'dir' ? '📁' : fileIcon(item.name);
      row.innerHTML = `
        <span class="tree-icon">${icon}</span>
        <span class="tree-name" title="${esc(item.name)}">${esc(item.name)}</span>
        ${item.type === 'dir' ? '<span class="tree-chevron">›</span>' : ''}`;

      if (item.type === 'dir') {
        const children = document.createElement('div');
        children.className = 'tree-children';
        let loaded = false;

        row.addEventListener('click', async e => {
          e.stopPropagation();
          row.classList.toggle('expanded');
          children.classList.toggle('open');
          if (!loaded) {
            loaded = true;
            children.innerHTML = '<div class="tree-loading" style="padding-left:16px"><div class="spin"></div></div>';
            await loadFileTree(item.path, children, depth + 1);
          }
        });
        ul.appendChild(row);
        ul.appendChild(children);
      } else {
        row.addEventListener('click', e => {
          e.stopPropagation();
          document.querySelectorAll('.tree-item').forEach(i => i.classList.remove('active'));
          row.classList.add('active');
          loadFileContent(item);
        });
        ul.appendChild(row);
      }
    });

    container.innerHTML = '';
    container.appendChild(ul);

  } catch (err) {
    container.innerHTML = `<div class="tree-loading" style="color:var(--text-3)">⚠️ Failed to load</div>`;
    console.error('Tree load error:', err);
  }
}

/* ── Load File Content ── */
async function loadFileContent(file) {
  const display   = document.getElementById('code-display');
  const filepath  = document.getElementById('code-filepath');
  const rawLink   = document.getElementById('raw-link');

  filepath.textContent = file.path;
  rawLink.href = file.download_url || file.html_url || '#';

  // Binary / image check
  const binaryExts = /\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|pdf|zip|tar|gz|exe|bin|woff|woff2|ttf|otf|mp3|mp4|mov|avi)$/i;
  const imageExts  = /\.(png|jpg|jpeg|gif|webp|svg|ico|bmp)$/i;

  if (binaryExts.test(file.name)) {
    if (imageExts.test(file.name)) {
      display.innerHTML = `
        <div class="file-notice">
          <div class="notice-icon">🖼️</div>
          <p>Image file: <strong>${esc(file.name)}</strong></p>
          <a href="${file.download_url}" target="_blank">View raw image ↗</a>
        </div>`;
    } else {
      display.innerHTML = `
        <div class="file-notice">
          <div class="notice-icon">📦</div>
          <p>Binary file: <strong>${esc(file.name)}</strong></p>
          <a href="${file.download_url || file.html_url}" target="_blank">Download / view on GitHub ↗</a>
        </div>`;
    }
    currentFileRaw = '';
    return;
  }

  // Large file warning (> 1MB GitHub limit)
  if (file.size > 900000) {
    display.innerHTML = `
      <div class="file-notice">
        <div class="notice-icon">📄</div>
        <p>File too large to display inline (${(file.size/1024).toFixed(1)} KB)</p>
        <a href="${file.html_url}" target="_blank">View on GitHub ↗</a>
      </div>`;
    currentFileRaw = '';
    return;
  }

  display.innerHTML = `
    <div class="code-placeholder">
      <div class="spin" style="width:28px;height:28px;border-width:3px;margin:0 auto"></div>
    </div>`;

  try {
    const url = file.download_url;
    if (!url) throw new Error('No download URL');

    const res  = await fetch(url);
    const text = await res.text();
    currentFileRaw = text;

    // Detect language from extension
    const ext  = (file.name.match(/\.([^.]+)$/) || [])[1] || '';
    const lang = extToLang(ext);

    const pre  = document.createElement('pre');
    const code = document.createElement('code');
    if (lang) code.className = `language-${lang}`;
    code.textContent = text;
    pre.appendChild(code);
    display.innerHTML = '';
    display.appendChild(pre);

    if (window.hljs) {
      if (lang) {
        hljs.highlightElement(code);
      } else {
        hljs.highlightElement(code);
      }
    }

  } catch (err) {
    display.innerHTML = `
      <div class="file-notice">
        <div class="notice-icon">⚠️</div>
        <p>Could not load file content.</p>
        <a href="${file.html_url}" target="_blank">View on GitHub ↗</a>
      </div>`;
    currentFileRaw = '';
  }
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg = '✓ Copied to clipboard') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ============================================================
   HELPERS
   ============================================================ */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s/86400)}d ago`;
  if (s < 31536000) return `${Math.floor(s/2592000)}mo ago`;
  return `${Math.floor(s/31536000)}y ago`;
}

function repoEmoji(repo) {
  const name = (repo.name || '').toLowerCase();
  const desc = (repo.description || '').toLowerCase();
  const lang = (repo.language   || '').toLowerCase();
  if (name.includes('game')  || desc.includes('game'))   return '🎮';
  if (name.includes('bot')   || desc.includes('bot'))    return '🤖';
  if (name.includes('api')   || desc.includes('api'))    return '🔌';
  if (name.includes('web')   || desc.includes('web'))    return '🌐';
  if (name.includes('tool')  || desc.includes('tool'))   return '🔧';
  if (name.includes('data')  || desc.includes('data'))   return '📊';
  if (name.includes('ml')    || desc.includes('machine')) return '🧠';
  if (name.includes('cli')   || desc.includes('cli'))    return '💻';
  if (lang === 'python')  return '🐍';
  if (lang === 'javascript' || lang === 'typescript') return '⚡';
  if (lang === 'rust')    return '⚙️';
  if (lang === 'go')      return '🐹';
  if (lang === 'java' || lang === 'kotlin') return '☕';
  return '📦';
}

function fileIcon(name) {
  const ext = (name.match(/\.([^.]+)$/) || [])[1] || '';
  const icons = {
    js: '🟨', ts: '🔷', jsx: '⚛️', tsx: '⚛️', py: '🐍',
    html: '🌐', css: '🎨', scss: '🎨', sass: '🎨',
    json: '📋', md: '📝', txt: '📄', yml: '⚙️', yaml: '⚙️',
    toml: '⚙️', env: '🔑', sh: '💻', bash: '💻', ps1: '💻',
    sql: '🗃️', rs: '⚙️', go: '🐹', java: '☕', kt: '☕',
    cs: '💠', cpp: '⚙️', c: '⚙️', h: '📎', php: '🐘',
    rb: '💎', swift: '🦅', dart: '🎯', vue: '💚', svelte: '🔶',
    dockerfile: '🐳', gitignore: '👁️', lock: '🔒',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', svg: '🎭',
    webp: '🖼️', ico: '⭐', pdf: '📕', zip: '📦',
  };
  return icons[ext.toLowerCase()] || '📄';
}

function extToLang(ext) {
  const map = {
    js: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'typescript', jsx: 'javascript',
    py: 'python', pyw: 'python', ipynb: 'json',
    html: 'html', htm: 'html', css: 'css',
    scss: 'scss', sass: 'scss', less: 'less',
    json: 'json', json5: 'json', jsonc: 'json',
    md: 'markdown', mdx: 'markdown',
    yaml: 'yaml', yml: 'yaml',
    toml: 'ini', ini: 'ini', cfg: 'ini',
    sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'bash', ps1: 'powershell',
    sql: 'sql', graphql: 'graphql', gql: 'graphql',
    rs: 'rust', go: 'go', rb: 'ruby',
    java: 'java', kt: 'kotlin', kts: 'kotlin',
    cs: 'csharp', cpp: 'cpp', cc: 'cpp', cxx: 'cpp',
    c: 'c', h: 'c', hpp: 'cpp',
    php: 'php', swift: 'swift', dart: 'dart',
    vue: 'html', svelte: 'html', xml: 'xml', svg: 'xml',
    dockerfile: 'dockerfile', makefile: 'makefile',
    r: 'r', lua: 'lua', hs: 'haskell', ex: 'elixir', exs: 'elixir',
    tf: 'hcl', hcl: 'hcl', proto: 'protobuf',
  };
  return map[ext.toLowerCase()] || '';
}

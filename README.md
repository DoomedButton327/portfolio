# 🚀 DoomedButton327 — Portfolio & GitHub Dashboard

A stunning dark glassmorphism portfolio site with a live GitHub repo dashboard and built-in code viewer.  
Built to be hosted on **GitHub Pages** — totally free.

---

## ✨ Features

- **Animated Starfield** — Canvas-powered stars and shooting stars
- **Live GitHub Stats** — Repos, Followers, Total Stars, Total Forks via GitHub API
- **Repo Dashboard** — Browse all your repos with search, language filters, and sort options
- **Code Viewer** — Click any repo to open a full file explorer + syntax-highlighted code viewer
- **Tech Stack Detection** — Automatically reads your languages from your repos
- **Dark Glassmorphism Design** — Purple, Blue, Black, Gold — deep space aesthetic
- **Fully Responsive** — Works on all screen sizes

---

## 📁 File Structure

```
portfolio/
├── index.html          ← Main page
├── css/
│   └── styles.css      ← All styles (glassmorphism, animations, modal)
├── js/
│   └── app.js          ← GitHub API, canvas, typewriter, code viewer
└── README.md           ← This file
```

---

## 🚀 Deploying to GitHub Pages (Free Hosting)

### Option 1 — Dedicated Repo (Recommended)

1. Create a new GitHub repo called `portfolio` (or any name you like)
2. Upload all these files (keeping the `css/` and `js/` folder structure)
3. Go to **Settings → Pages**
4. Under **Source**, select `main` branch → `/ (root)`
5. Click **Save**
6. Your site will be live at `https://DoomedButton327.github.io/portfolio`

### Option 2 — Your Special `username.github.io` Repo

1. Create a repo named exactly `DoomedButton327.github.io`
2. Upload all files to the root
3. Site auto-deploys at `https://DoomedButton327.github.io`

---

## 🎨 Customisation

### Change your bio / tagline
Edit the typewriter phrases in `js/app.js`:
```js
const PHRASES = [
  'Developer & Creator ✦',
  'Building things on GitHub',
  // Add your own here
];
```

### Add skills manually
In `index.html`, find `id="skills-list"` — skills are auto-detected from your repos, but you can add custom ones.

### Change accent colors
In `css/styles.css`, edit the `:root` variables:
```css
--purple: #8b5cf6;
--blue:   #3b82f6;
--gold:   #f59e0b;
--green:  #10b981;
```

### Add contact links (email, Twitter, LinkedIn)
In `index.html`, find the `#contact` section and add your links.

---

## ⚠️ GitHub API Rate Limits

The GitHub API allows **60 requests/hour** for unauthenticated users.  
If you hit rate limits, the repos section will show an error with a link to your GitHub profile.

To increase limits, you can add a **Personal Access Token** (read-only, no scopes needed):
```js
// In js/app.js, add headers to fetch calls:
headers: { 'Authorization': 'token YOUR_TOKEN_HERE' }
```
> ⚠️ Never commit tokens to a public repo! Use GitHub Actions secrets or environment variables if needed.

---

## 🛠 Tech Used

| Tool | Purpose |
|------|---------|
| Vanilla HTML/CSS/JS | No build step needed |
| GitHub API v3 | Live repo data |
| Highlight.js (CDN) | Syntax highlighting |
| Google Fonts (Orbitron, Syne, JetBrains Mono) | Typography |
| Canvas API | Starfield animation |
| CSS Backdrop Filter | Glassmorphism cards |

---

## 📄 License

MIT — Do whatever you want with it.

---

Built with 🔮 by DoomedButton327

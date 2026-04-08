## Blackout Reboot (HTML / CSS / JS + HiveMQ)

Plain static pages. **Phone ↔ PC data only goes through HiveMQ (MQTT)** — no backend in this repo.

### Files

- `mobile.html` – mobile flow  
- `desktop.html` – desktop dashboard (subscribes to names on MQTT)  
- `styles.css` – styles  
- `map-embedded.svg` – map asset  
- `hivemq-client.js` – connects and exposes `BlackoutMQTT`  
- `MQtest.html` – manual connect / publish / subscribe test (optional; reads `mqtt-config.js` if present)  
- `mqtt-config.example.js` → copy to **`mqtt-config.js`** and add HiveMQ credentials (`mqtt-config.js` is gitignored)

### 1. Configure HiveMQ

1. Copy `mqtt-config.example.js` to `mqtt-config.js`.  
2. Set `host`, `username`, `password` (and optional `nameTopic`; default topic is `blackout/reboot/names`).  
3. In HiveMQ Cloud, allow this user to **publish + subscribe** on that topic.

### Phone and PC on **different** Wi‑Fi (or phone on cellular)

**MQTT does not care about your LAN.** As long as both devices have **internet**, they talk to **HiveMQ in the cloud** — same Wi‑Fi is **not** required.

What *does* need a reachable URL is **how you open the HTML files** (browsers still load the page over http/https):

- **Easiest for class/demo:** put the project on **GitHub Pages** (or Netlify / Vercel static hosting). Then **both** phone and PC open the **same** public link, e.g. `https://<you>.github.io/<repo>/desktop.html` and `…/mobile.html`. MQTT sync works across any networks.
- **Local PC server** (`http://电脑IP:8080/...`) only works for phones that can **reach that IP** (often same Wi‑Fi). For different networks, use a **public** host instead.

### 2. How to open the project (use http/https — not `file://`)

Browsers need a **local or hosted URL** so MQTT + the CDN script load reliably.

**Option A — VS Code “Live Server”**  

- Install extension **Live Server**.  
- Right‑click `desktop.html` → *Open with Live Server* (note the port, often 5500).  
- Open `mobile.html` the same way (or change the path in the address bar to `/mobile.html`).

**Option B — any static server**  

From the project folder, if you have Python:

```bash
python -m http.server 8080
```

Then in the browser:

- PC: `http://localhost:8080/desktop.html`  
- Phone on **same Wi‑Fi** as the PC: `http://<your-PC-IPv4>:8080/mobile.html` (`ipconfig` → Wireless → IPv4).  
- Phone on **another network:** use a **public** URL (e.g. GitHub Pages) for both devices, not the PC’s private IP.

### 2b. MQtest page

Open **`MQtest.html`** with Live Server (or your static host). Click **Connect & subscribe**, then **Publish** — you should see **RECV** in the log. Default topic matches the app: `blackout/reboot/names` (change if you set `nameTopic` in config). Credentials can be filled from **`mqtt-config.js`** automatically when that file is present.

### 3. How to test MQTT name sync

1. Start the static server (Live Server or Python as above).  
2. On the **PC**: open **`desktop.html`**. Wait until the bottom-left list shows **“—”** or names (not “正在连接 HiveMQ…” forever).  
3. On the **phone** (or second browser tab): open **`mobile.html`**, go through the flow, enter a name, tap **OK**.  
4. The name should appear **immediately** in the desktop **“Names from mobile”** box.  
5. If it fails: open **Developer Tools → Console** on both sides and check for `[Blackout MQTT]` errors or wrong credentials.

### Deploy on Vercel (repo already on GitHub)

1. **Import** the GitHub repo in [Vercel](https://vercel.com/new) (or open the existing project).
2. **Framework Preset:** Other (or “No framework”).  
   **Build Command:** `npm run build`  
   **Output Directory:** `.` (root, default)
3. **Environment variables** (Project → Settings → Environment Variables), for **Production** (and Preview if you want):

   | Name | Example / note |
   |------|----------------|
   | `MQTT_HOST` | `xxxx.s1.eu.hivemq.cloud` (no `wss://`) |
   | `MQTT_USERNAME` | HiveMQ dashboard user |
   | `MQTT_PASSWORD` | HiveMQ password |
   | `MQTT_WS_PORT` | `8884` (optional) |
   | `MQTT_WS_PATH` | `/mqtt` (optional) |
   | `MQTT_NAME_TOPIC` | `blackout/reboot/names` (optional) |

   The Vercel build (`scripts/vercel-build.cjs`) copies HTML/CSS/JS/SVG into **`public/`** and writes **`public/mqtt-config.js`** from env. That folder has **no** `package.json`, so Vercel treats it as **static files** (avoids “No entrypoint” errors). Locally, `npm run build` **does nothing** unless `VERCEL=1`; keep using **`mqtt-config.js`** in the repo root for local dev.
4. **Redeploy** after saving env vars.

**Vercel settings:** **Output Directory** must be **`public`**. **Framework Preset** must be **Other** (this repo sets `"framework": null` in `vercel.json` so Vercel serves static files from `public/` instead of looking for a Node `index.js`). If the dashboard overrides Framework or Output Directory, clear those overrides or match `vercel.json`.

**Live URLs** (replace with your deployment domain):

- `https://<project>.vercel.app/` — index with links  
- `https://<project>.vercel.app/mobile.html` — mobile  
- `https://<project>.vercel.app/desktop.html` — desktop  
- Short paths: `/mobile`, `/desktop`, `/mqtest`

Phone and PC can use these **https** links from **any network**; MQTT still goes to HiveMQ.

### Figma

- Prototype: `https://www.figma.com/proto/dn15F6aFXlkokcR7HLZ3qN/Untitled?node-id=0-1&t=LC20a27vE4qlRnU1-1`  
- Design: `https://www.figma.com/design/dn15F6aFXlkokcR7HLZ3qN/Untitled?node-id=0-1&m=dev&t=LC20a27vE4qlRnU1-1`

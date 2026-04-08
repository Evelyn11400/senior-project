## Responsive Web Project (Plain HTML/CSS/JS)

This project implements a responsive web page based on a Figma design using **only** HTML, CSS, and vanilla JavaScript.

### Structure

- `mobile.html` – mobile flow (splash, connect, dashboard)
- `desktop.html` – desktop dashboard
- `styles.css` – global and layout styles
- `map-embedded.svg` – map graphic (embedded raster)
- `hivemq-client.js` – optional MQTT client
- `mqtt-config.example.js` – copy to `mqtt-config.js` and add HiveMQ credentials (the real `mqtt-config.js` is gitignored)

### HiveMQ

1. Copy `mqtt-config.example.js` to `mqtt-config.js`.
2. Fill in `host`, `username`, and `password` from your HiveMQ Cloud cluster.

### Getting Started

1. Open `index.html` directly in your browser, or use a simple local server (for example, with VS Code or any static server).
2. Open the Figma file in Dev mode to inspect:
   - Font families, sizes, and weights
   - Colors (HEX or RGBA)
   - Spacing (padding, margin), border radius, and layout
3. Translate those values into `styles.css`, starting from mobile sizes and then adding media queries for larger screens.

### Figma Reference

Current design URLs:

- Prototype: `https://www.figma.com/proto/dn15F6aFXlkokcR7HLZ3qN/Untitled?node-id=0-1&t=LC20a27vE4qlRnU1-1`
- Design (Dev mode): `https://www.figma.com/design/dn15F6aFXlkokcR7HLZ3qN/Untitled?node-id=0-1&m=dev&t=LC20a27vE4qlRnU1-1`


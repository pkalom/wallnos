import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Prevent dark mode flash before React renders
if (localStorage.getItem("wp_dark") === "1") {
  document.body.classList.add("dark");
}

const styleEl = document.createElement("style");
styleEl.textContent = `
  :root {
    --bg: #fafafa;
    --bg-header: rgba(250,250,250,0.92);
    --bg-card: #eeeeee;
    --bg-search: #f0f0f0;
    --border: #ebebeb;
    --border-ui: #dddddd;
    --text: #111111;
    --text-sec: #666666;
    --text-muted: #999999;
    --spinner-track: #dddddd;
    --spinner-head: #111111;
    --active-bg: #111111;
    --active-text: #ffffff;
    --notice-bg: #fff8e1;
    --notice-text: #7a6000;
    --notice-border: #ffe082;
    --shimmer-highlight: rgba(255,255,255,0.22);
    --view-pill-bg: #ffffff;
  }
  body.dark {
    --bg: #0f0f0f;
    --bg-header: rgba(15,15,15,0.92);
    --bg-card: #1e1e1e;
    --bg-search: #1a1a1a;
    --border: #2a2a2a;
    --border-ui: #333333;
    --text: #f0f0f0;
    --text-sec: #aaaaaa;
    --text-muted: #555555;
    --spinner-track: #333333;
    --spinner-head: #f0f0f0;
    --active-bg: #f0f0f0;
    --active-text: #111111;
    --notice-bg: #1f1800;
    --notice-text: #d4a017;
    --notice-border: #3d2e00;
    --shimmer-highlight: rgba(255,255,255,0.07);
    --view-pill-bg: #2a2a2a;
  }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.93); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { display: none; }
  body { background: var(--bg); transition: background 0.3s; }

  @media (max-width: 768px) {
    .wallnos-header-inner {
      flex-wrap: wrap;
      height: auto !important;
      padding: 10px 0 !important;
      gap: 8px !important;
    }
    .wallnos-search-wrap {
      order: 3;
      max-width: 100% !important;
      width: 100%;
    }
    .wallnos-header-right {
      order: 2;
      margin-left: auto;
    }
    .wallnos-view-modes { display: none !important; }
    .wallnos-main { padding: 16px 12px 60px !important; }
    .wallnos-hero { height: 260px !important; }
    .wallnos-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .wallnos-grid-large { grid-template-columns: 1fr !important; }
    .wallnos-overlay {
      padding: 0 !important;
      align-items: flex-end !important;
    }
    .wallnos-overlay-content {
      width: 100% !important;
      max-width: 100% !important;
      border-radius: 16px 16px 0 0 !important;
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      max-height: 92vh !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
    }
    .wallnos-preview-img {
      max-height: 58vh !important;
      object-fit: contain !important;
      background: #000 !important;
    }
    .wallnos-preview-bar {
      padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
    }
    .wallnos-hero-overlay {
      padding: 16px !important;
    }
    .wallnos-hero-title {
      font-size: 18px !important;
      margin-bottom: 4px !important;
    }
    .wallnos-hero-label {
      font-size: 10px !important;
      padding: 2px 8px !important;
      margin-bottom: 6px !important;
    }
  }

  @media (max-width: 480px) {
    .wallnos-grid { grid-template-columns: 1fr !important; }
    .wallnos-hero { height: 200px !important; }
  }
`;
document.head.appendChild(styleEl);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

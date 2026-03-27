import { useState } from "react";
import type { CSSProperties } from "react";
import { Search, X, Sun, Moon, Heart, LayoutGrid, Columns2, Maximize2, Layers, Upload, LogIn, LogOut, User, Check } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { CATEGORIES } from "../constants/categories";
import { styles } from "../styles/styles";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  activeCategory: number;
  setActiveCategory: (i: number) => void;
  showFavs: boolean;
  setShowFavs: (v: boolean | ((prev: boolean) => boolean)) => void;
  showUploads: boolean;
  setShowUploads: (v: boolean | ((prev: boolean) => boolean)) => void;
  viewMode: string;
  setViewMode: (v: string) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  favCount: number;
  uploadCount: number;
  isFreshLoading: boolean;
  user: SupabaseUser | null;
  onLoginClick: () => void;
  onSignOut: () => void;
}

const VIEW_ICONS = {
  grid:    <LayoutGrid size={14} />,
  masonry: <Columns2 size={14} />,
  large:   <Maximize2 size={14} />,
};

export default function Header({
  search, setSearch,
  activeCategory, setActiveCategory,
  showFavs, setShowFavs,
  showUploads, setShowUploads,
  viewMode, setViewMode,
  darkMode, setDarkMode,
  favCount, uploadCount, isFreshLoading,
  user, onLoginClick, onSignOut,
}: Props) {
  const [signingOut, setSigningOut] = useState(false);

  return (
    <header style={styles.header} className="wallnos-header">
      <div style={styles.headerInner} className="wallnos-header-inner">
        <div style={styles.logo}>
          <Layers size={20} color="#8b5cf6" />
          <span style={{
            ...styles.logoText,
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>WallNos</span>
        </div>
        <div style={styles.searchWrap} className="wallnos-search-wrap">
          <Search size={17} color="var(--text-muted)" style={{ marginRight: 8, flexShrink: 0 }} />
          <input
            style={styles.searchInput}
            placeholder="Search wallpapers…"
            value={search}
            onChange={e => { setSearch(e.target.value); setShowFavs(false); }}
            aria-label="Search wallpapers"
          />
          {isFreshLoading && search ? (
            <div style={styles.searchSpinner} />
          ) : search ? (
            <button style={styles.clearBtn} onClick={() => setSearch("")} aria-label="Clear search">
              <X size={16} />
            </button>
          ) : null}
        </div>
        <div style={styles.headerRight} className="wallnos-header-right">
          <div style={styles.viewModes} className="wallnos-view-modes">
            {["grid", "masonry", "large"].map((mode) => (
              <button
                key={mode}
                style={{ ...styles.viewModeBtn, ...(viewMode === mode ? styles.viewModeBtnActive : {}) }}
                onClick={() => setViewMode(mode)}
                title={`${mode} view`}
                aria-label={`${mode} view`}
              >
                {VIEW_ICONS[mode]}
              </button>
            ))}
          </div>
          <button
            style={styles.darkToggle}
            onClick={() => setDarkMode(v => !v)}
            title={darkMode ? "Light mode" : "Dark mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, animation: "slideUp 0.3s ease" }}>
              <div style={userAvatar} title={user.email}>
                <User size={14} />
              </div>
              <button
                style={styles.darkToggle}
                onClick={() => { setSigningOut(true); setTimeout(() => { onSignOut(); setSigningOut(false); }, 800); }}
                title="Sign out"
                aria-label="Sign out"
              >
                {signingOut ? <Check size={16} color="#4ade80" /> : <LogOut size={16} />}
              </button>
            </div>
          ) : (
            <button style={loginBtn} onClick={onLoginClick} aria-label="Sign in">
              <LogIn size={15} />
              <span>Sign in</span>
            </button>
          )}
          <button
            style={{ ...styles.favToggle, ...(showFavs ? styles.favToggleActive : {}) }}
            onClick={() => { setShowFavs(v => !v); setShowUploads(false); }}
            aria-label={`Favorites (${favCount})`}
          >
            <Heart size={16} fill={showFavs ? "currentColor" : "none"} />
            <span style={styles.favCount}>{favCount}</span>
          </button>
          <button
            style={{ ...styles.favToggle, ...(showUploads ? styles.uploadToggleActive : {}) }}
            onClick={() => { setShowUploads(v => !v); setShowFavs(false); }}
            aria-label={`My uploads (${uploadCount})`}
          >
            <Upload size={16} />
            <span style={styles.favCount}>{uploadCount}</span>
          </button>
        </div>
      </div>
      {!showFavs && (
        <div style={{ position: "relative" }}>
          <div style={styles.categories}>
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                style={{ ...styles.catBtn, ...(activeCategory === i && !search ? styles.catBtnActive : {}) }}
                onClick={() => { setActiveCategory(i); setSearch(""); }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div style={fadeLeft} />
          <div style={fadeRight} />
        </div>
      )}
    </header>
  );
}

const fadeLeft: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: 32,
  background: "linear-gradient(to right, var(--bg-header), transparent)",
  pointerEvents: "none",
};

const fadeRight: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 0,
  bottom: 0,
  width: 48,
  background: "linear-gradient(to left, var(--bg-header), transparent)",
  pointerEvents: "none",
};

const loginBtn: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 14px",
  borderRadius: 8,
  border: "none",
  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  flexShrink: 0,
};

const userAvatar: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

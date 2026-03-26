import { useState, useEffect, useRef } from "react";
import {
  Search, X, Sun, Moon, Heart, LayoutGrid, Columns2, Maximize2,
  ChevronLeft, ChevronRight, Copy, Check, Download, Loader2, Layers,
} from "lucide-react";
import { CATEGORIES } from "./constants/categories";
import { usePhotos } from "./hooks/usePhotos";
import PhotoCard from "./components/PhotoCard";
import { styles } from "./styles/styles";

export default function App() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wp_favs") || "[]"); } catch { return []; }
  });
  const [previewIndex, setPreviewIndex] = useState(null);
  const [showFavs, setShowFavs] = useState(false);
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(null);
  const [downloadDone, setDownloadDone] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("wp_dark") === "1");
  const [viewMode, setViewMode] = useState("grid");

  const VIEW_ICONS = {
    grid:    <LayoutGrid size={14} />,
    masonry: <Columns2 size={14} />,
    large:   <Maximize2 size={14} />,
  };
  const [copyDone, setCopyDone] = useState(false);

  const { photos, loading, hasMore, usingDemo, fetchPhotos } = usePhotos();

  const searchTimeout = useRef(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const modalPhotosRef = useRef([]);

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    try { localStorage.setItem("wp_dark", darkMode ? "1" : "0"); } catch {}
  }, [darkMode]);

  useEffect(() => {
    const query = search.trim() || CATEGORIES[activeCategory].query;
    setPage(1);
    fetchPhotos(query, 1, false);
  }, [activeCategory, fetchPhotos]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const query = search.trim() || CATEGORIES[activeCategory].query;
      setPage(1);
      fetchPhotos(query, 1, false);
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  useEffect(() => {
    try { localStorage.setItem("wp_favs", JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const next = page + 1;
        setPage(next);
        const query = search.trim() || CATEGORIES[activeCategory].query;
        fetchPhotos(query, next, true);
      }
    }, { threshold: 0.1 });
    observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, page, search, activeCategory]);

  // Keyboard navigation — uses ref so closure is always fresh
  useEffect(() => {
    if (previewIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") { setPreviewIndex(null); setCopyDone(false); }
      if (e.key === "ArrowLeft") {
        setPreviewIndex(i => Math.max(0, i - 1));
        setCopyDone(false);
      }
      if (e.key === "ArrowRight") {
        setPreviewIndex(i => Math.min(modalPhotosRef.current.length - 1, i + 1));
        setCopyDone(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewIndex]);

  const toggleFav = (photo) => {
    setFavorites(prev =>
      prev.find(p => p.id === photo.id)
        ? prev.filter(p => p.id !== photo.id)
        : [...prev, photo]
    );
  };

  const isFav = (id) => favorites.some(p => p.id === id);

  const downloadPhoto = async (photo) => {
    setDownloading(photo.id);
    try {
      const res = await fetch(photo.urls.full);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wallpaper-${photo.id}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadDone(photo.id);
      setTimeout(() => setDownloadDone(d => d === photo.id ? null : d), 2000);
    } catch {
      window.open(photo.urls.full, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  const copyLink = async (photo) => {
    try {
      await navigator.clipboard.writeText(photo.urls.regular);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {}
  };

  // Derived
  const showHero = !showFavs && !search && photos.length > 0;
  const heroPhoto = showHero ? photos[0] : null;
  const displayedPhotos = showFavs ? favorites : showHero ? photos.slice(1) : photos;
  const modalPhotos = showFavs ? favorites : photos;
  modalPhotosRef.current = modalPhotos;

  const isFreshLoading = loading && page === 1;
  const preview = previewIndex !== null ? modalPhotos[previewIndex] : null;

  const openPreview = (photo) => {
    const idx = modalPhotos.findIndex(p => p.id === photo.id);
    setPreviewIndex(idx !== -1 ? idx : 0);
    setCopyDone(false);
  };

  const closePreview = () => { setPreviewIndex(null); setCopyDone(false); };

  const navModal = (dir) => {
    setPreviewIndex(i => {
      const next = i + dir;
      if (next < 0 || next >= modalPhotosRef.current.length) return i;
      return next;
    });
    setCopyDone(false);
  };

  const getGridStyle = () => {
    const fade = {
      opacity: isFreshLoading && photos.length > 0 ? 0.35 : 1,
      transition: "opacity 0.3s",
    };
    if (viewMode === "masonry") return { columnWidth: "260px", columnGap: "16px", ...fade };
    if (viewMode === "large")   return { ...styles.gridLarge, ...fade };
    return { ...styles.grid, ...fade };
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <Layers size={20} color="var(--text)" />
            <span style={styles.logoText}>WallNos</span>
          </div>
          <div style={styles.searchWrap}>
            <Search size={17} color="var(--text-muted)" style={{ marginRight: 8, flexShrink: 0 }} />
            <input
              style={styles.searchInput}
              placeholder="Search wallpapers…"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowFavs(false); }}
            />
            {isFreshLoading && search ? (
              <div style={styles.searchSpinner} />
            ) : search ? (
              <button style={styles.clearBtn} onClick={() => setSearch("")}><X size={16} /></button>
            ) : null}
          </div>
          <div style={styles.headerRight}>
            <div style={styles.viewModes}>
              {["grid", "masonry", "large"].map((mode) => (
                <button
                  key={mode}
                  style={{ ...styles.viewModeBtn, ...(viewMode === mode ? styles.viewModeBtnActive : {}) }}
                  onClick={() => setViewMode(mode)}
                  title={`${mode} view`}
                >{VIEW_ICONS[mode]}</button>
              ))}
            </div>
            <button
              style={styles.darkToggle}
              onClick={() => setDarkMode(v => !v)}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              style={{ ...styles.favToggle, ...(showFavs ? styles.favToggleActive : {}) }}
              onClick={() => setShowFavs(v => !v)}
            >
              <Heart size={16} fill={showFavs ? "currentColor" : "none"} />
              <span style={styles.favCount}>{favorites.length}</span>
            </button>
          </div>
        </div>
        {!showFavs && (
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
        )}
      </header>

      {/* Demo notice */}
      {usingDemo && (
        <div style={styles.notice}>
          Demo mode — Add your <strong>Unsplash API key</strong> to <code>.env</code> as <code>VITE_UNSPLASH_ACCESS_KEY</code> for live photos
        </div>
      )}

      {/* Main */}
      <main style={styles.main}>
        {showFavs && favorites.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>♡</div>
            <p style={styles.emptyText}>No favorites yet</p>
            <p style={styles.emptySubtext}>Tap the heart on any wallpaper to save it here</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            {heroPhoto && (
              <div style={styles.hero} onClick={() => openPreview(heroPhoto)}>
                <img src={heroPhoto.urls.regular} alt={heroPhoto.alt_description} style={styles.heroImg} />
                <div style={styles.heroOverlay}>
                  <p style={styles.heroLabel}>Featured</p>
                  <p style={styles.heroTitle}>{heroPhoto.alt_description || "Beautiful Wallpaper"}</p>
                  <p style={styles.heroPhotographer}>by {heroPhoto.user?.name}</p>
                  <div style={styles.heroActions}>
                    <button
                      style={{ ...styles.heroBtn, ...styles.heroBtnPrimary }}
                      onClick={e => { e.stopPropagation(); openPreview(heroPhoto); }}
                    >Preview</button>
                    <button
                      style={{ ...styles.heroBtn, display: "inline-flex", alignItems: "center", gap: 6 }}
                      onClick={e => { e.stopPropagation(); downloadPhoto(heroPhoto); }}
                    >
                      {downloadDone === heroPhoto.id
                        ? <><Check size={14} /> Saved</>
                        : <><Download size={14} /> Download</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Initial load spinner */}
            {isFreshLoading && photos.length === 0 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                <div style={styles.spinner} />
              </div>
            )}

            {/* Grid */}
            <div style={getGridStyle()}>
              {displayedPhotos.map((photo, idx) => (
                <PhotoCard
                  key={`${photo.id}-${idx}`}
                  photo={photo}
                  index={idx}
                  viewMode={viewMode}
                  isFav={isFav(photo.id)}
                  onToggleFav={() => toggleFav(photo)}
                  onPreview={() => openPreview(photo)}
                  onDownload={() => downloadPhoto(photo)}
                  isDownloading={downloading === photo.id}
                  isDownloadDone={downloadDone === photo.id}
                />
              ))}
            </div>

            {!showFavs && (
              <div ref={loadMoreRef} style={styles.loadMore}>
                {loading && page > 1 && <div style={styles.spinner} />}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {preview && (
        <div style={styles.overlay} onClick={closePreview}>
          <div style={styles.overlayContent} onClick={e => e.stopPropagation()}>
            <div style={{ position: "relative" }}>
              <img
                key={preview.id}
                src={preview.urls.regular}
                alt={preview.alt_description}
                style={{ ...styles.previewImg, animation: "modalIn 0.22s ease" }}
              />
              {previewIndex > 0 && (
                <button style={{ ...styles.modalNav, left: 14 }} onClick={() => navModal(-1)}><ChevronLeft size={20} /></button>
              )}
              {previewIndex < modalPhotos.length - 1 && (
                <button style={{ ...styles.modalNav, right: 14 }} onClick={() => navModal(+1)}><ChevronRight size={20} /></button>
              )}
            </div>
            <div style={styles.previewBar}>
              <div>
                <p style={styles.previewName}>{preview.user?.name}</p>
                <p style={styles.previewDesc}>{preview.alt_description || "Wallpaper"}</p>
              </div>
              <div style={styles.previewActions}>
                <button
                  style={{
                    ...styles.actionBtn,
                    ...(copyDone ? { color: "#4ade80", background: "#0a1f0a", borderColor: "#1a3a1a" } : {}),
                  }}
                  onClick={() => copyLink(preview)}
                  title="Copy link"
                >
                  {copyDone ? <Check size={18} /> : <Copy size={18} />}
                </button>
                <button
                  style={{ ...styles.actionBtn, ...(isFav(preview.id) ? styles.actionBtnFav : {}) }}
                  onClick={() => toggleFav(preview)}
                  title={isFav(preview.id) ? "Remove favorite" : "Add favorite"}
                >
                  <Heart size={18} fill={isFav(preview.id) ? "currentColor" : "none"} />
                </button>
                <button
                  style={{
                    ...styles.actionBtn,
                    ...(downloadDone === preview.id ? styles.actionBtnDone : styles.actionBtnDl),
                  }}
                  onClick={() => downloadPhoto(preview)}
                  title="Download"
                >
                  {downloading === preview.id
                    ? <Loader2 size={18} style={{ animation: "spin 0.7s linear infinite" }} />
                    : downloadDone === preview.id
                      ? <Check size={18} />
                      : <Download size={18} />}
                </button>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={closePreview}><X size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
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
  const [preview, setPreview] = useState(null);
  const [showFavs, setShowFavs] = useState(false);
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(null);

  const { photos, loading, hasMore, usingDemo, fetchPhotos } = usePhotos();

  const searchTimeout = useRef(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

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
    } catch {
      window.open(photo.urls.full, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  const displayedPhotos = showFavs ? favorites : photos;

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoMark}>◈</span>
            <span style={styles.logoText}>Walls</span>
          </div>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              style={styles.searchInput}
              placeholder="Search wallpapers…"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowFavs(false); }}
            />
            {search && (
              <button style={styles.clearBtn} onClick={() => setSearch("")}>×</button>
            )}
          </div>
          <button
            style={{ ...styles.favToggle, ...(showFavs ? styles.favToggleActive : {}) }}
            onClick={() => setShowFavs(v => !v)}
          >
            {showFavs ? "♥" : "♡"} <span style={styles.favCount}>{favorites.length}</span>
          </button>
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

      {/* Grid */}
      <main style={styles.main}>
        {showFavs && favorites.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>♡</div>
            <p style={styles.emptyText}>No favorites yet</p>
            <p style={styles.emptySubtext}>Tap the heart on any wallpaper to save it here</p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {displayedPhotos.map((photo, idx) => (
                <PhotoCard
                  key={`${photo.id}-${idx}`}
                  photo={photo}
                  isFav={isFav(photo.id)}
                  onToggleFav={() => toggleFav(photo)}
                  onPreview={() => setPreview(photo)}
                  onDownload={() => downloadPhoto(photo)}
                  isDownloading={downloading === photo.id}
                />
              ))}
            </div>
            {!showFavs && (
              <div ref={loadMoreRef} style={styles.loadMore}>
                {loading && <div style={styles.spinner} />}
              </div>
            )}
          </>
        )}
      </main>

      {/* Fullscreen Preview */}
      {preview && (
        <div style={styles.overlay} onClick={() => setPreview(null)}>
          <div style={styles.overlayContent} onClick={e => e.stopPropagation()}>
            <img
              src={preview.urls.regular}
              alt={preview.alt_description}
              style={styles.previewImg}
            />
            <div style={styles.previewBar}>
              <div>
                <p style={styles.previewName}>{preview.user?.name}</p>
                <p style={styles.previewDesc}>{preview.alt_description || "Wallpaper"}</p>
              </div>
              <div style={styles.previewActions}>
                <button
                  style={{ ...styles.actionBtn, ...(isFav(preview.id) ? styles.actionBtnFav : {}) }}
                  onClick={() => toggleFav(preview)}
                >
                  {isFav(preview.id) ? "♥" : "♡"}
                </button>
                <button
                  style={{ ...styles.actionBtn, ...styles.actionBtnDl }}
                  onClick={() => downloadPhoto(preview)}
                >
                  {downloading === preview.id ? "…" : "↓"}
                </button>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={() => setPreview(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

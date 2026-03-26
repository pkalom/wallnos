import { useState, useEffect, useRef } from "react";
import type { Photo } from "./types";
import { CATEGORIES } from "./constants/categories";
import { usePhotos } from "./hooks/usePhotos";
import { useUploads } from "./hooks/useUploads";
import Header from "./components/Header";
import PhotoGrid from "./components/PhotoGrid";
import PreviewModal from "./components/PreviewModal";
import UploadZone from "./components/UploadZone";
import { styles } from "./styles/styles";

export default function App() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const [favorites, setFavorites] = useState<Photo[]>(() => {
    try { return JSON.parse(localStorage.getItem("wp_favs") || "[]"); } catch { return []; }
  });
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [showFavs, setShowFavs] = useState(false);
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadDone, setDownloadDone] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("wp_dark") === "1");
  const [viewMode, setViewMode] = useState("grid");
  const [copyDone, setCopyDone] = useState(false);
  const [showUploads, setShowUploads] = useState(false);

  const { photos, loading, hasMore, usingDemo, fetchPhotos } = usePhotos();
  const { uploads, addUpload, removeUpload } = useUploads();

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const modalPhotosRef = useRef<Photo[]>([]);

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

  useEffect(() => {
    if (previewIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") { setPreviewIndex(null); setCopyDone(false); }
      if (e.key === "ArrowLeft") { setPreviewIndex(i => Math.max(0, i - 1)); setCopyDone(false); }
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

  const showHero = !showFavs && !showUploads && !search && photos.length > 0;
  const heroPhoto = showHero ? photos[0] : null;
  const displayedPhotos = showFavs ? favorites : showUploads ? uploads : showHero ? photos.slice(1) : photos;
  const modalPhotos = showFavs ? favorites : showUploads ? uploads : photos;
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

  return (
    <div style={styles.root}>
      <Header
        search={search}
        setSearch={setSearch}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showFavs={showFavs}
        setShowFavs={setShowFavs}
        showUploads={showUploads}
        setShowUploads={setShowUploads}
        viewMode={viewMode}
        setViewMode={setViewMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        favCount={favorites.length}
        uploadCount={uploads.length}
        isFreshLoading={isFreshLoading}
      />

      {usingDemo && (
        <div style={styles.notice}>
          Demo mode — Add your <strong>Unsplash API key</strong> to <code>.env</code> as <code>VITE_UNSPLASH_ACCESS_KEY</code> for live photos
        </div>
      )}

      <main style={styles.main} className="wallnos-main">
        {showUploads && (
          <UploadZone onUpload={addUpload} />
        )}
        <PhotoGrid
          photos={photos}
          displayedPhotos={displayedPhotos}
          viewMode={viewMode}
          isFav={isFav}
          onToggleFav={toggleFav}
          onPreview={openPreview}
          onDownload={downloadPhoto}
          downloading={downloading}
          downloadDone={downloadDone}
          loading={loading}
          page={page}
          showFavs={showFavs}
          showUploads={showUploads}
          onRemoveUpload={removeUpload}
          isFreshLoading={isFreshLoading}
          heroPhoto={heroPhoto}
          loadMoreRef={loadMoreRef}
        />
      </main>

      <PreviewModal
        preview={preview}
        previewIndex={previewIndex}
        modalPhotosLength={modalPhotos.length}
        navModal={navModal}
        closePreview={closePreview}
        isFav={isFav}
        onToggleFav={toggleFav}
        copyLink={copyLink}
        copyDone={copyDone}
        downloading={downloading}
        downloadDone={downloadDone}
        onDownload={downloadPhoto}
      />
    </div>
  );
}

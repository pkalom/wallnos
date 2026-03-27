import { type RefObject } from "react";
import { Heart, Check, Download, Upload } from "lucide-react";
import PhotoCard from "./PhotoCard";
import type { Photo } from "../types";
import { styles } from "../styles/styles";

interface Props {
  photos: Photo[];
  displayedPhotos: Photo[];
  viewMode: string;
  isFav: (id: string) => boolean;
  onToggleFav: (photo: Photo) => void;
  onPreview: (photo: Photo) => void;
  onDownload: (photo: Photo) => void;
  downloading: string | null;
  downloadDone: string | null;
  loading: boolean;
  page: number;
  showFavs: boolean;
  showUploads: boolean;
  onRemoveUpload: (id: string) => void;
  isFreshLoading: boolean;
  heroPhoto: Photo | null;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}

export default function PhotoGrid({
  photos,
  displayedPhotos,
  viewMode,
  isFav,
  onToggleFav,
  onPreview,
  onDownload,
  downloading,
  downloadDone,
  loading,
  page,
  showFavs,
  showUploads,
  onRemoveUpload,
  isFreshLoading,
  heroPhoto,
  loadMoreRef,
}: Props) {
  const getGridStyle = () => {
    const fade = {
      opacity: isFreshLoading ? 0 : 1,
      transition: isFreshLoading ? "opacity 0.15s ease" : "opacity 0.4s ease",
    };
    if (viewMode === "masonry") return { columnWidth: "260px", columnGap: "16px", ...fade };
    if (viewMode === "large")   return { ...styles.gridLarge, ...fade };
    return { ...styles.grid, ...fade };
  };

  if ((showFavs || showUploads) && displayedPhotos.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>
          {showUploads
            ? <Upload size={48} color="var(--border-ui)" />
            : <Heart size={48} color="var(--border-ui)" />}
        </div>
        <p style={styles.emptyText}>{showUploads ? "No uploads yet" : "No favorites yet"}</p>
        <p style={styles.emptySubtext}>
          {showUploads
            ? "Drop your images above to add them here"
            : "Tap the heart on any wallpaper to save it here"}
        </p>
      </div>
    );
  }

  return (
    <>
      {heroPhoto && (
        <div style={styles.hero} className="wallnos-hero" onClick={() => onPreview(heroPhoto)}>
          <img src={heroPhoto.urls.regular} alt={heroPhoto.alt_description} style={styles.heroImg} />
          <div style={styles.heroOverlay} className="wallnos-hero-overlay">
            <p style={styles.heroLabel} className="wallnos-hero-label">Featured</p>
            <p style={styles.heroTitle} className="wallnos-hero-title">{heroPhoto.alt_description || "Beautiful Wallpaper"}</p>
            <p style={styles.heroPhotographer}>by {heroPhoto.user?.name}</p>
            <div style={styles.heroActions}>
              <button
                style={{ ...styles.heroBtn, ...styles.heroBtnPrimary }}
                onClick={e => { e.stopPropagation(); onPreview(heroPhoto); }}
              >
                Preview
              </button>
              <button
                style={{ ...styles.heroBtn, display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={e => { e.stopPropagation(); onDownload(heroPhoto); }}
              >
                {downloadDone === heroPhoto.id
                  ? <><Check size={14} /> Saved</>
                  : <><Download size={14} /> Download</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {isFreshLoading && photos.length === 0 && (
        <div style={getGridStyle()} className={`wallnos-grid${viewMode === "large" ? "-large" : ""}`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              ...styles.card,
              ...(viewMode === "masonry" ? { aspectRatio: "auto", height: 240, marginBottom: 16, display: "inline-block", width: "100%" } : {}),
              animation: "none",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, background: "var(--bg-card)" }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "linear-gradient(90deg, transparent 0%, var(--shimmer-highlight) 50%, transparent 100%)",
                  backgroundSize: "400px 100%",
                  animation: `shimmer 1.4s ${i * 0.08}s infinite linear`,
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={getGridStyle()} className={`wallnos-grid${viewMode === "large" ? "-large" : ""}`}>
        {displayedPhotos.map((photo, idx) => (
          <PhotoCard
            key={`${photo.id}-${idx}`}
            photo={photo}
            index={idx}
            viewMode={viewMode}
            isFav={isFav(photo.id)}
            onToggleFav={() => onToggleFav(photo)}
            onPreview={() => onPreview(photo)}
            onDownload={() => onDownload(photo)}
            isDownloading={downloading === photo.id}
            isDownloadDone={downloadDone === photo.id}
            onDelete={photo.isUpload ? () => onRemoveUpload(photo.id) : null}
          />
        ))}
      </div>

      {!showFavs && (
        <div ref={loadMoreRef} style={styles.loadMore}>
          {loading && page > 1 && <div style={styles.spinner} />}
        </div>
      )}
    </>
  );
}

import { useRef } from "react";
import { Heart, ChevronLeft, ChevronRight, Copy, Check, Download, Loader2, X } from "lucide-react";
import type { Photo } from "../types";
import { styles } from "../styles/styles";

interface Props {
  preview: Photo | null;
  previewIndex: number | null;
  modalPhotosLength: number;
  navModal: (dir: number) => void;
  closePreview: () => void;
  isFav: (id: string) => boolean;
  onToggleFav: (photo: Photo) => void;
  copyLink: (photo: Photo) => void;
  copyDone: boolean;
  downloading: string | null;
  downloadDone: string | null;
  onDownload: (photo: Photo) => void;
}

export default function PreviewModal({
  preview,
  previewIndex,
  modalPhotosLength,
  navModal,
  closePreview,
  isFav,
  onToggleFav,
  copyLink,
  copyDone,
  downloading,
  downloadDone,
  onDownload,
}: Props) {
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) navModal(delta > 0 ? 1 : -1);
    touchStartX.current = null;
  };

  if (!preview) return null;

  return (
    <div style={styles.overlay} className="wallnos-overlay" onClick={closePreview}>
      <div
        style={styles.overlayContent}
        className="wallnos-overlay-content"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ position: "relative" }}>
          <img
            key={preview.id}
            src={preview.urls.regular}
            alt={preview.alt_description}
            style={{ ...styles.previewImg, animation: "modalIn 0.22s ease" }}
            className="wallnos-preview-img"
          />
          {previewIndex > 0 && (
            <button
              style={{ ...styles.modalNav, left: 14 }}
              onClick={() => navModal(-1)}
              aria-label="Previous wallpaper"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {previewIndex < modalPhotosLength - 1 && (
            <button
              style={{ ...styles.modalNav, right: 14 }}
              onClick={() => navModal(+1)}
              aria-label="Next wallpaper"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
        <div style={styles.previewBar} className="wallnos-preview-bar">
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
              aria-label="Copy link"
            >
              {copyDone ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <button
              style={{ ...styles.actionBtn, ...(isFav(preview.id) ? styles.actionBtnFav : {}) }}
              onClick={() => onToggleFav(preview)}
              aria-label={isFav(preview.id) ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} fill={isFav(preview.id) ? "currentColor" : "none"} />
            </button>
            <button
              style={{
                ...styles.actionBtn,
                ...(downloadDone === preview.id ? styles.actionBtnDone : styles.actionBtnDl),
              }}
              onClick={() => onDownload(preview)}
              aria-label="Download wallpaper"
            >
              {downloading === preview.id
                ? <Loader2 size={18} style={{ animation: "spin 0.7s linear infinite" }} />
                : downloadDone === preview.id
                  ? <Check size={18} />
                  : <Download size={18} />}
            </button>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={closePreview} aria-label="Close preview">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

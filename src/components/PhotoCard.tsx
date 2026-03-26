import { useState } from "react";
import { Heart, Download, Check, Loader2, Trash2 } from "lucide-react";
import type { Photo } from "../types";
import { styles } from "../styles/styles";

interface Props {
  photo: Photo;
  index: number;
  viewMode: string;
  isFav: boolean;
  onToggleFav: () => void;
  onPreview: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  isDownloadDone: boolean;
  onDelete?: (() => void) | null;
}

export default function PhotoCard({
  photo, index, viewMode, isFav, onToggleFav,
  onPreview, onDownload, isDownloading, isDownloadDone, onDelete,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isMasonry = viewMode === "masonry";
  const staggerDelay = `${Math.min(index, 15) * 55}ms`;

  const cardStyle = {
    ...styles.card,
    ...(hovered ? styles.cardHover : {}),
    animation: "fadeInUp 0.4s ease both",
    animationDelay: staggerDelay,
    ...(isMasonry ? {
      breakInside: "avoid",
      marginBottom: "16px",
      display: "inline-block",
      width: "100%",
      aspectRatio: "auto",
    } : {}),
  };

  const imgWrapStyle = isMasonry
    ? { ...styles.imgWrap, height: "auto" }
    : styles.imgWrap;

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={imgWrapStyle} onClick={onPreview}>
        {!isMasonry && (
          <div style={{ ...styles.imgPlaceholder, background: photo.color || "var(--bg-card)", opacity: loaded ? 0 : 1 }}>
            {!loaded && (
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "linear-gradient(90deg, transparent 0%, var(--shimmer-highlight) 50%, transparent 100%)",
                backgroundSize: "400px 100%",
                animation: "shimmer 1.4s infinite linear",
              }} />
            )}
          </div>
        )}
        <img
          src={photo.urls.small}
          alt={photo.alt_description}
          style={{
            ...styles.img,
            ...(isMasonry ? { height: "auto" } : {}),
            opacity: loaded ? 1 : 0,
          }}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      </div>
      <div style={{ ...styles.cardOverlay, opacity: hovered ? 1 : 0 }}>
        {photo.user?.name && (
          <p style={styles.cardPhotographer}>{photo.user.name}</p>
        )}
        <button style={styles.previewBtn} onClick={onPreview}>Preview</button>
        <div style={styles.cardIcons}>
          <button
            style={{ ...styles.iconBtn, ...(isFav ? styles.iconBtnFav : {}) }}
            onClick={e => { e.stopPropagation(); onToggleFav(); }}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={15} fill={isFav ? "currentColor" : "none"} />
          </button>
          <button
            style={{ ...styles.iconBtn, ...(isDownloadDone ? styles.iconBtnDone : {}) }}
            onClick={e => { e.stopPropagation(); onDownload(); }}
            title="Download"
            aria-label="Download"
          >
            {isDownloadDone
              ? <Check size={15} />
              : isDownloading
                ? <Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} />
                : <Download size={15} />}
          </button>
          {onDelete && (
            <button
              style={{ ...styles.iconBtn, background: "rgba(220,50,50,0.55)", borderColor: "rgba(220,50,50,0.4)" }}
              onClick={e => { e.stopPropagation(); onDelete(); }}
              title="Remove upload"
              aria-label="Remove upload"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { styles } from "../styles/styles";

export default function PhotoCard({ photo, isFav, onToggleFav, onPreview, onDownload, isDownloading }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ ...styles.card, ...(hovered ? styles.cardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.imgWrap} onClick={onPreview}>
        <div style={{ ...styles.imgPlaceholder, background: photo.color || "#f0f0f0", opacity: loaded ? 0 : 1 }} />
        <img
          src={photo.urls.small}
          alt={photo.alt_description}
          style={{ ...styles.img, opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      </div>
      <div style={{ ...styles.cardOverlay, opacity: hovered ? 1 : 0 }}>
        <button style={styles.previewBtn} onClick={onPreview}>Preview</button>
        <div style={styles.cardIcons}>
          <button
            style={{ ...styles.iconBtn, ...(isFav ? styles.iconBtnFav : {}) }}
            onClick={e => { e.stopPropagation(); onToggleFav(); }}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            {isFav ? "♥" : "♡"}
          </button>
          <button
            style={styles.iconBtn}
            onClick={e => { e.stopPropagation(); onDownload(); }}
            title="Download"
          >
            {isDownloading ? "…" : "↓"}
          </button>
        </div>
      </div>
    </div>
  );
}

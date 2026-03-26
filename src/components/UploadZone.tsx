import { useState, useRef, type CSSProperties } from "react";
import { Upload } from "lucide-react";

const zoneBase: CSSProperties = {
  border: "2px dashed var(--border-ui)",
  borderRadius: 16,
  padding: "40px 24px",
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.2s, background 0.2s",
  marginBottom: 28,
};

const zoneActive: CSSProperties = {
  borderColor: "var(--active-bg)",
  background: "var(--bg-search)",
};

export default function UploadZone({ onUpload }: { onUpload: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .forEach(f => onUpload(f));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      style={{ ...zoneBase, ...(dragging ? zoneActive : {}) }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      aria-label="Upload wallpapers"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={e => handleFiles(e.target.files)}
      />
      <Upload size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
        Drop images here or click to browse
      </p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
        Supports JPG, PNG, WebP
      </p>
    </div>
  );
}

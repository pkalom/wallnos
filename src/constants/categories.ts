import type { Category, Photo } from "../types";

export const UNSPLASH_ACCESS_KEY: string = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || "YOUR_UNSPLASH_ACCESS_KEY";

export const CATEGORIES: Category[] = [
  { label: "All", query: "wallpaper" },
  { label: "Nature", query: "nature landscape" },
  { label: "Architecture", query: "architecture minimal" },
  { label: "Abstract", query: "abstract texture" },
  { label: "Space", query: "space cosmos galaxy" },
  { label: "Ocean", query: "ocean sea water" },
  { label: "City", query: "city urban night" },
  { label: "Forest", query: "forest trees" },
];

export const DEMO_PHOTOS: Photo[] = Array.from({ length: 20 }, (_, i) => ({
  id: `demo-${i}`,
  urls: {
    small: `https://picsum.photos/seed/${i + 10}/400/600`,
    regular: `https://picsum.photos/seed/${i + 10}/1080/1920`,
    full: `https://picsum.photos/seed/${i + 10}/2160/3840`,
  },
  user: { name: "Demo Photographer", username: "demo" },
  alt_description: "Beautiful wallpaper",
  color: "#e0e0e0",
}));

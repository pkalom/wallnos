import { useState, useCallback } from "react";
import type { Photo } from "../types";
import { UNSPLASH_ACCESS_KEY, DEMO_PHOTOS } from "../constants/categories";

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  const fetchPhotos = useCallback(async (query: string, pg = 1, append = false) => {
    setLoading(true);
    try {
      if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === "YOUR_UNSPLASH_ACCESS_KEY") {
        await new Promise(r => setTimeout(r, 600));
        const shuffled = [...DEMO_PHOTOS].sort(() => Math.random() - 0.5);
        setPhotos(append ? prev => [...prev, ...shuffled] : shuffled);
        setUsingDemo(true);
        setHasMore(pg < 3);
      } else {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&page=${pg}&orientation=portrait`,
          { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
        );
        const data = await res.json();
        setPhotos(append ? prev => [...prev, ...data.results] : data.results);
        setHasMore(data.total_pages > pg);
        setUsingDemo(false);
      }
    } catch {
      setPhotos(DEMO_PHOTOS);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { photos, loading, hasMore, usingDemo, fetchPhotos, setPhotos };
}

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import type { Photo } from "../types";
import { supabase } from "../lib/supabase";

export function useFavorites(user: User | null) {
  const [favorites, setFavorites] = useState<Photo[]>([]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    supabase
      .from("favorites")
      .select("photo_data")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setFavorites(data.map(row => row.photo_data as Photo));
      });
  }, [user]);

  const toggleFav = async (photo: Photo) => {
    if (!user) return;
    const already = favorites.some(p => p.id === photo.id);
    if (already) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("photo_id", photo.id);
      setFavorites(prev => prev.filter(p => p.id !== photo.id));
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, photo_id: photo.id, photo_data: photo });
      setFavorites(prev => [...prev, photo]);
    }
  };

  const isFav = (id: string) => favorites.some(p => p.id === id);

  return { favorites, toggleFav, isFav };
}

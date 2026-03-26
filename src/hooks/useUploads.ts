import { useState, useEffect, useCallback } from "react";
import type { Photo } from "../types";

const DB_NAME = "wallnos";
const STORE = "uploads";
const DB_VERSION = 1;

interface UploadRecord {
  id: string;
  name: string;
  blob: Blob;
  uploadedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(): Promise<UploadRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as UploadRecord[]);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(record: UploadRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function recordToPhoto(record: UploadRecord): Photo {
  const url = URL.createObjectURL(record.blob);
  return {
    id: record.id,
    urls: { small: url, regular: url, full: url },
    alt_description: record.name,
    user: { name: "My Upload" },
    color: "#555",
    isUpload: true,
  };
}

export function useUploads() {
  const [uploads, setUploads] = useState<Photo[]>([]);

  useEffect(() => {
    dbGetAll().then(records => {
      setUploads(records.map(recordToPhoto));
    }).catch(() => {});
  }, []);

  const addUpload = useCallback(async (file: File) => {
    const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const record: UploadRecord = { id, name: file.name, blob: file, uploadedAt: Date.now() };
    await dbPut(record);
    setUploads(prev => [...prev, recordToPhoto(record)]);
  }, []);

  const removeUpload = useCallback(async (id: string) => {
    await dbDelete(id);
    setUploads(prev => prev.filter(p => p.id !== id));
  }, []);

  return { uploads, addUpload, removeUpload };
}

export interface Photo {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string | null;
  user?: { name: string; username?: string };
  color?: string;
  isUpload?: boolean;
}

export interface Category {
  label: string;
  query: string;
}

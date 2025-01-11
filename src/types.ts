export interface Payload {
  q: string;
  s: string;
  o: string;
  api: string;
  vqd: string;
  kl: string;
  bing_market: string;
  df?: "d" | "w" | "m" | "y";
  [key: string]: string | undefined; // for allowing additional properties
}

export interface SearchResult {
  title: string;
  href: string;
  body: string;
}

export interface ImageResult {
  title: string;
  image: string;
  thumbnail: string;
  url: string;
  height: number;
  width: number;
  source: string;
}

export interface VideoResult {
  content: string;
  [key: string]: any;
}

export interface NewsResult {
  date: string;
  title: string;
  body: string;
  url: string;
  image: string;
  source: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type Region = "wt-wt" | "us-en" | "uk-en" | "ru-ru" | string;
export type SafeSearch = "on" | "moderate" | "off";
export type TimeLimit = "d" | "w" | "m" | "y" | null;
export type Backend = "auto" | "html" | "lite";
export type ImageSize = "Small" | "Medium" | "Large" | "Wallpaper" | null;

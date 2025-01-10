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
  role: 'user' | 'assistant';
  content: string;
}

export type Region = 'wt-wt' | 'us-en' | 'uk-en' | 'ru-ru' | string;
export type SafeSearch = 'on' | 'moderate' | 'off';
export type TimeLimit = 'd' | 'w' | 'm' | 'y' | null;
export type Backend = 'auto' | 'html' | 'lite';
export type ImageSize = 'Small' | 'Medium' | 'Large' | 'Wallpaper' | null;
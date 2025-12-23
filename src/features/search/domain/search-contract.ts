export type ResultType =
  | "surah"
  | "juz"
  | "hizb"
  | "page"
  | "surahAyah"
  | "ayah";

/** Unified outcome the UI can render. */
export type SearchRow = {
  sura: number;
  ayah: number;
  surahName: string;
  simple: string;
  page: number;
  type: ResultType;
};

/** UI state (explicit state machine). */
export type SearchState =
  | { kind: "entry" }
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "error"; message: string }
  | { kind: "results"; items: SearchRow[] };

/** Domain interface every searcher must implement. */
export interface Searcher {
  /** Returns zero or more rows for a given query. Must never throw. */
  search(query: string, limit?: number): Promise<SearchRow[]>;
}

/** Composite searcher orchestrates multiple searchers. */
export interface Composite {
  search(query: string, limit?: number): Promise<SearchRow[]>;
}

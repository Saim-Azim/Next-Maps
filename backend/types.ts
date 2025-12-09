export interface StructuredAddress {
  building?: string;
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  structured: StructuredAddress;
  source: 'cache' | 'api';
}

export interface CacheEntry {
  address: string;
  normalized: string;
  lat: number;
  lng: number;
  structured: StructuredAddress;
  displayName: string;
  embedding: number[];
  timestamp: Date;
}

export interface AutocompleteResult {
  displayName: string;
  address: StructuredAddress;
}

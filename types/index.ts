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

export interface AutocompleteResult {
  displayName: string;
  address: StructuredAddress;
}

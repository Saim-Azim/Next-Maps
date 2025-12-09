import axios from 'axios';
import { StructuredAddress, GeocodingResult } from '../types';

export class GeocodingService {
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private userAgent = 'LocationAddressApp/1.0';

  /**
   * Geocode an address to coordinates
   */
  async geocode(address: string): Promise<GeocodingResult | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1,
          countrycodes: 'in', // India only
        },
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 5000,
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
          structured: this.parseAddress(result.address),
          source: 'api',
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 5000,
      });

      if (response.data) {
        return {
          lat,
          lng,
          displayName: response.data.display_name,
          structured: this.parseAddress(response.data.address),
          source: 'api',
        };
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Get autocomplete suggestions for an address
   */
  async autocomplete(query: string): Promise<Array<{ displayName: string; address: StructuredAddress }>> {
    try {
      // Add Maharashtra to query for better regional results
      const enhancedQuery = query.includes('Maharashtra') ? query : `${query}, Maharashtra`;
      
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: enhancedQuery,
          format: 'json',
          addressdetails: 1,
          limit: 5,
          countrycodes: 'in',
        },
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 5000,
      });

      if (response.data && Array.isArray(response.data)) {
        // Filter results to prefer Maharashtra addresses
        const results = response.data.map((result: any) => ({
          displayName: result.display_name,
          address: this.parseAddress(result.address),
        }));
        
        // Sort Maharashtra results first
        return results.sort((a, b) => {
          const aIsMH = a.displayName.toLowerCase().includes('maharashtra');
          const bIsMH = b.displayName.toLowerCase().includes('maharashtra');
          if (aIsMH && !bIsMH) return -1;
          if (!aIsMH && bIsMH) return 1;
          return 0;
        });
      }

      return [];
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  /**
   * Parse OSM address object into structured format
   */
  private parseAddress(osmAddress: any): StructuredAddress {
    return {
      building: osmAddress.building || osmAddress.house_number,
      street: osmAddress.road || osmAddress.street,
      area: osmAddress.suburb || osmAddress.neighbourhood || osmAddress.quarter,
      city: osmAddress.city || osmAddress.town || osmAddress.village || osmAddress.municipality,
      state: osmAddress.state,
      pincode: osmAddress.postcode,
      country: osmAddress.country,
    };
  }
}

export const geocodingService = new GeocodingService();

import NodeCache from 'node-cache';
import { CacheEntry, GeocodingResult } from '../types';
import { ollamaService } from './ollamaService';
import { geocodingService } from './geocodingService';
import { normalizeAddress, cosineSimilarity, haversineDistance } from '../utils/distance';

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '86400'); // 24 hours
const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.85');
const DISTANCE_THRESHOLD = parseInt(process.env.DISTANCE_THRESHOLD_METERS || '500');

export class SemanticCacheService {
  private cache: NodeCache;
  private cacheEntries: CacheEntry[] = [];

  constructor() {
    this.cache = new NodeCache({ stdTTL: CACHE_TTL });
  }

  /**
   * Get geocoding result with semantic cache lookup
   */
  async geocodeWithCache(address: string): Promise<GeocodingResult | null> {
    const normalized = normalizeAddress(address);

    // Generate embedding for the query
    const queryEmbedding = await ollamaService.generateEmbedding(normalized);

    // Search for similar cached entries
    const cachedResult = await this.findSimilar(normalized, queryEmbedding);

    if (cachedResult) {
      console.log(`Cache HIT for: ${address}`);
      return {
        lat: cachedResult.lat,
        lng: cachedResult.lng,
        displayName: cachedResult.displayName,
        structured: cachedResult.structured,
        source: 'cache',
      };
    }

    console.log(`Cache MISS for: ${address}`);

    // Call geocoding API
    const result = await geocodingService.geocode(address);

    if (result) {
      // Store in cache
      await this.store(address, normalized, result, queryEmbedding);
    }

    return result;
  }

  /**
   * Reverse geocode with cache
   */
  async reverseGeocodeWithCache(lat: number, lng: number): Promise<GeocodingResult | null> {
    // Check if we have a nearby cached location
    const nearby = this.findNearby(lat, lng, 100); // 100m radius

    if (nearby) {
      console.log(`Cache HIT for reverse geocode: ${lat}, ${lng}`);
      return {
        lat: nearby.lat,
        lng: nearby.lng,
        displayName: nearby.displayName,
        structured: nearby.structured,
        source: 'cache',
      };
    }

    console.log(`Cache MISS for reverse geocode: ${lat}, ${lng}`);

    // Call reverse geocoding API
    const result = await geocodingService.reverseGeocode(lat, lng);

    if (result) {
      const normalized = normalizeAddress(result.displayName);
      const embedding = await ollamaService.generateEmbedding(normalized);
      await this.store(result.displayName, normalized, result, embedding);
    }

    return result;
  }

  /**
   * Find similar address in cache using semantic similarity and geographic distance
   */
  private async findSimilar(normalizedAddress: string, queryEmbedding: number[]): Promise<CacheEntry | null> {
    let bestMatch: CacheEntry | null = null;
    let bestScore = 0;

    for (const entry of this.cacheEntries) {
      // Calculate semantic similarity
      const similarity = cosineSimilarity(queryEmbedding, entry.embedding);

      if (similarity > SIMILARITY_THRESHOLD) {
        // If semantically similar, also check geographic distance
        if (bestMatch) {
          const distance = haversineDistance(entry.lat, entry.lng, bestMatch.lat, bestMatch.lng);
          if (distance < DISTANCE_THRESHOLD && similarity > bestScore) {
            bestMatch = entry;
            bestScore = similarity;
          }
        } else {
          bestMatch = entry;
          bestScore = similarity;
        }
      }
    }

    return bestMatch;
  }

  /**
   * Find nearby cached location by geographic coordinates
   */
  private findNearby(lat: number, lng: number, radiusMeters: number): CacheEntry | null {
    for (const entry of this.cacheEntries) {
      const distance = haversineDistance(lat, lng, entry.lat, entry.lng);
      if (distance < radiusMeters) {
        return entry;
      }
    }
    return null;
  }

  /**
   * Store result in cache
   */
  private async store(
    address: string,
    normalized: string,
    result: GeocodingResult,
    embedding: number[]
  ): Promise<void> {
    const cacheEntry: CacheEntry = {
      address,
      normalized,
      lat: result.lat,
      lng: result.lng,
      structured: result.structured,
      displayName: result.displayName,
      embedding,
      timestamp: new Date(),
    };

    const key = `geo:${normalized}`;
    this.cache.set(key, cacheEntry);
    this.cacheEntries.push(cacheEntry);

    // Limit cache size to 1000 entries
    if (this.cacheEntries.length > 1000) {
      const removed = this.cacheEntries.shift();
      if (removed) {
        this.cache.del(`geo:${removed.normalized}`);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      entries: this.cacheEntries.length,
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
    };
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.flushAll();
    this.cacheEntries = [];
  }
}

export const semanticCacheService = new SemanticCacheService();

'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { GeocodingResult, AutocompleteResult } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface LocationInputProps {
  onResult: (result: GeocodingResult) => void;
  onLoading: (loading: boolean) => void;
}

export default function LocationInput({ onResult, onLoading }: LocationInputProps) {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);

  // Request current location on mount
  useEffect(() => {
    if (!useManualInput) {
      requestCurrentLocation();
    }
  }, [useManualInput]);

  const requestCurrentLocation = () => {
    if ('geolocation' in navigator) {
      onLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.post(`${API_URL}/api/reverse-geocode`, {
              lat: latitude,
              lng: longitude,
            });
            onResult(response.data);
            setAddress(response.data.displayName);
            setError('');
          } catch (err) {
            setError('Failed to get address for your location');
            setUseManualInput(true);
          } finally {
            onLoading(false);
          }
        },
        () => {
          setError('Location permission denied. Please enter address manually.');
          setUseManualInput(true);
          onLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported. Please enter address manually.');
      setUseManualInput(true);
    }
  };

  // Debounced autocomplete
  useEffect(() => {
    if (!address || address.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        console.log(`🔍 Fetching autocomplete for: "${address}"`);
        const response = await axios.get(`${API_URL}/api/autocomplete`, {
          params: { query: address },
        });
        console.log(`✅ Received ${response.data.length} suggestions:`, response.data);
        setSuggestions(response.data);
        setShowSuggestions(response.data.length > 0);
      } catch (err) {
        console.error('❌ Autocomplete error:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    onLoading(true);
    setError('');
    setShowSuggestions(false);

    try {
      const response = await axios.post(`${API_URL}/api/geocode`, {
        address: address.trim(),
      });
      onResult(response.data);
    } catch (err) {
      setError('Address not found. Please try a different address.');
    } finally {
      onLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: AutocompleteResult) => {
    setAddress(suggestion.displayName);
    setShowSuggestions(false);
    onLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/geocode`, {
        address: suggestion.displayName,
      });
      onResult(response.data);
    } catch (err) {
      setError('Failed to geocode selected address');
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📍 Enter Location
        </h2>
        {!useManualInput && (
          <button
            onClick={() => setUseManualInput(true)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Manual Input
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Enter address or paste full address (e.g., Pune Railway Station, Maharashtra)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onMouseDown={(e) => {
                    // Prevent input blur to allow click
                    e.preventDefault();
                    handleSuggestionClick(suggestion);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-200 border-none"
                >
                  {suggestion.displayName}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search Location
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!useManualInput && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-sm text-blue-700 dark:text-blue-200">
          💡 We'll try to use your current location, or you can enter an address manually.
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import LocationInput from '@/components/LocationInput';
import AddressDisplay from '@/components/AddressDisplay';
import MapView from '@/components/MapView';
import { GeocodingResult } from '@/types';

export default function Home() {
  const [result, setResult] = useState<GeocodingResult | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen p-6 md:p-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            📍 Location Finder
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Find addresses with AI-powered semantic caching
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Input and Address Details */}
          <div className="space-y-6">
            <LocationInput
              onResult={(geocodingResult) => {
                setResult(geocodingResult);
                setLoading(false);
              }}
              onLoading={setLoading}
            />

            {result && <AddressDisplay result={result} loading={loading} />}
          </div>

          {/* Right Column: Map */}
          <div className="h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            {result ? (
              <MapView lat={result.lat} lng={result.lng} displayName={result.displayName} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg
                    className="mx-auto h-24 w-24 text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-xl">Enter an address to see it on the map</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cache Info */}
        {result && result.source === 'cache' && (
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
            <p className="text-green-800 dark:text-green-200">
              ⚡ Result loaded from semantic cache - No API call needed!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

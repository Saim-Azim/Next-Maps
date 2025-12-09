'use client';

import { GeocodingResult } from '@/types';

interface AddressDisplayProps {
  result: GeocodingResult;
  loading: boolean;
}

export default function AddressDisplay({ result, loading }: AddressDisplayProps) {
  const { structured, displayName, lat, lng, source } = result;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📋 Address Details
        </h2>
        {source === 'cache' && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            ⚡ Cached
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Full Address */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Full Address
          </label>
          <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {displayName}
          </p>
        </div>

        {/* Structured Fields */}
        <div className="grid grid-cols-2 gap-4">
          {structured.building && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Building/House No.
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {structured.building}
              </p>
            </div>
          )}

          {structured.street && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Street
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {structured.street}
              </p>
            </div>
          )}

          {structured.area && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Area/Locality
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {structured.area}
              </p>
            </div>
          )}

          {structured.city && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                City
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {structured.city}
              </p>
            </div>
          )}

          {structured.state && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                State
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {structured.state}
              </p>
            </div>
          )}

          {structured.pincode && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                PIN Code
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {structured.pincode}
              </p>
            </div>
          )}
        </div>

        {/* Coordinates */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Coordinates
          </label>
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400">Latitude</div>
              <div className="text-lg font-mono text-gray-900 dark:text-white">
                {lat.toFixed(6)}
              </div>
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400">Longitude</div>
              <div className="text-lg font-mono text-gray-900 dark:text-white">
                {lng.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

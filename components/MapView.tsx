'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  lat: number;
  lng: number;
  displayName: string;
}

// Fix for default marker icon
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView({ lat, lng, displayName }: MapViewProps) {
  useEffect(() => {
    // Remove existing map if any
    const container = document.getElementById('map');
    if (container) {
      container.innerHTML = '';
    }

    // Create new map
    const map = L.map('map').setView([lat, lng], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    L.marker([lat, lng], { icon })
      .addTo(map)
      .bindPopup(`<strong>${displayName}</strong><br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`)
      .openPopup();

    // Cleanup
    return () => {
      map.remove();
    };
  }, [lat, lng, displayName]);

  return (
    <div className="h-full w-full">
      <div id="map" className="h-full w-full rounded-lg"></div>
    </div>
  );
}

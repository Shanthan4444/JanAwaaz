import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { locationService } from '../../services/location/locationService';

export const LeafletMapPicker = ({
  initialLocation = { latitude: 17.3850, longitude: 78.4867, area: 'Khairatabad', landmark: 'Hussain Sagar' },
  onChange
}) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({
    latitude: initialLocation.latitude || 17.3850,
    longitude: initialLocation.longitude || 78.4867,
    area: initialLocation.area || 'Khairatabad / Banjara Hills',
    landmark: initialLocation.landmark || ''
  });

  const [isLocating, setIsLocating] = useState(false);

  // Reverse geocode via OpenStreetMap Nominatim API with fallback
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const road = data.address.road || data.address.suburb || data.address.neighbourhood || data.address.residential || 'Sector Area';
          const city = data.address.city || data.address.town || data.address.county || 'City';
          const landmark = data.display_name ? data.display_name.split(',')[0] : '';

          return {
            area: `${road}, ${city}`,
            landmark: landmark || road
          };
        }
      }
    } catch (err) {
      console.warn('[REVERSE GEOCODE WARN]', err);
    }

    // Realistic fallback based on lat/lng coordinates
    if (lat > 17.41) return { area: 'Banjara Hills / Panjagutta', landmark: 'Road No. 12' };
    if (lat > 17.40) return { area: 'Khairatabad / Hussain Sagar', landmark: 'NTR Marg' };
    if (lat > 17.39) return { area: 'Himayat Nagar / Lakdi-ka-pul', landmark: 'Main Road' };
    if (lat > 17.38) return { area: 'Nampally / Abids', landmark: 'Station Road' };
    return { area: 'Ghatkesar / ORR Service Road', landmark: 'ORR Exit' };
  };

  const updateLocationState = (lat, lng, area, landmark) => {
    const updated = {
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      area: area || coords.area,
      landmark: landmark || coords.landmark,
      address: `📍 ${area || coords.area}, (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`
    };
    setCoords(updated);
    if (onChange) onChange(updated);
  };

  // Fetch Live GPS Location on Mount & on Button Click
  const fetchCurrentGpsLocation = async () => {
    setIsLocating(true);
    try {
      const gpsLoc = await locationService.getCurrentLocation();
      const lat = gpsLoc.latitude;
      const lng = gpsLoc.longitude;

      if (leafletMapRef.current && markerRef.current) {
        leafletMapRef.current.setView([lat, lng], 15);
        markerRef.current.setLatLng([lat, lng]);
      }

      updateLocationState(lat, lng, gpsLoc.area, gpsLoc.landmark);
    } catch (err) {
      console.warn('[GPS FETCH WARN]', err);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    // 1. Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = async () => {
      if (!window.L || !mapContainerRef.current || leafletMapRef.current) return;

      const defaultLat = coords.latitude;
      const defaultLng = coords.longitude;

      const map = window.L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 14,
        zoomControl: true
      });

      leafletMapRef.current = map;

      // Add OpenStreetMap Tile Layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '🏢 Leaflet | © OpenStreetMap'
      }).addTo(map);

      // Custom Red Pin Marker
      const marker = window.L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      const handlePinMove = async (lat, lng) => {
        const geoInfo = await reverseGeocode(lat, lng);
        updateLocationState(lat, lng, geoInfo.area, geoInfo.landmark);
      };

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handlePinMove(lat, lng);
      });

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handlePinMove(pos.lat, pos.lng);
      });

      // Auto-fetch real GPS location on mount!
      fetchCurrentGpsLocation();
    };

    if (window.L) {
      initMap();
    } else if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    }
  }, []);

  const handleAreaChange = (val) => {
    const updated = { ...coords, area: val, address: `📍 ${val}` };
    setCoords(updated);
    if (onChange) onChange(updated);
  };

  const handleLandmarkChange = (val) => {
    const updated = { ...coords, landmark: val };
    setCoords(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-brand-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📍 Location Details
        </h3>

        <button
          type="button"
          onClick={fetchCurrentGpsLocation}
          disabled={isLocating}
          style={{
            backgroundColor: 'var(--color-brand-subtle)',
            color: 'var(--color-brand-primary)',
            border: '1px solid var(--color-brand-border)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            fontSize: 'var(--font-xs)',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isLocating ? <RefreshCw size={14} className="animate-spin" /> : <Navigation size={14} />}
          {isLocating ? 'LOCATING...' : '🎯 LOCATE MY GPS POSITION'}
        </button>
      </div>

      {/* Leaflet OpenStreetMap Container */}
      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border-default)', marginBottom: 'var(--space-2)' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '260px', backgroundColor: '#e5e7eb' }} />
      </div>

      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontWeight: 700 }}>
        📌 Click on the map or drag the red pin to adjust location — Area auto-fills!
      </p>

      {/* 2x2 Input Grid matching user's exact design */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Latitude
          </label>
          <input
            type="text"
            readOnly
            value={coords.latitude}
            style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-sm)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Longitude
          </label>
          <input
            type="text"
            readOnly
            value={coords.longitude}
            style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-sm)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Area / Locality *
          </label>
          <input
            type="text"
            value={coords.area}
            onChange={(e) => handleAreaChange(e.target.value)}
            placeholder="Auto-filled or type manually"
            style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-brand-border)', color: 'var(--color-text-primary)', fontSize: 'var(--font-sm)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Landmark
          </label>
          <input
            type="text"
            value={coords.landmark}
            onChange={(e) => handleLandmarkChange(e.target.value)}
            placeholder="Auto-filled or type manually"
            style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)', fontSize: 'var(--font-sm)' }}
          />
        </div>
      </div>
    </div>
  );
};

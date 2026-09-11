import React, { useEffect, useRef, useState, Component } from 'react';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { locationService } from '../../services/location/locationService';

// Error boundary to protect against Leaflet runtime / DOM crashes
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn('[LEAFLET MAP ERROR BOUNDARY]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

const LeafletMapPickerInner = ({
  initialLocation,
  onChange
}) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  const safeLat = typeof initialLocation?.latitude === 'number' && !isNaN(initialLocation.latitude)
    ? initialLocation.latitude
    : 17.3850;
  const safeLng = typeof initialLocation?.longitude === 'number' && !isNaN(initialLocation.longitude)
    ? initialLocation.longitude
    : 78.4867;

  const [coords, setCoords] = useState({
    latitude: safeLat,
    longitude: safeLng,
    area: initialLocation?.area || 'University Sector',
    landmark: initialLocation?.landmark || 'Main Entrance Gate'
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

    if (lat > 17.41) return { area: 'Banjara Hills / Panjagutta', landmark: 'Road No. 12' };
    if (lat > 17.40) return { area: 'Khairatabad / Hussain Sagar', landmark: 'NTR Marg' };
    if (lat > 17.39) return { area: 'Himayat Nagar / Lakdi-ka-pul', landmark: 'Main Road' };
    if (lat > 17.38) return { area: 'Nampally / Abids', landmark: 'Station Road' };
    return { area: 'University Sector', landmark: 'Main Entrance Gate' };
  };

  const updateLocationState = (lat, lng, area, landmark) => {
    const numLat = typeof lat === 'number' && !isNaN(lat) ? lat : safeLat;
    const numLng = typeof lng === 'number' && !isNaN(lng) ? lng : safeLng;
    const resolvedArea = area || coords.area || 'University Sector';
    const resolvedLandmark = landmark || coords.landmark || '';

    const updated = {
      latitude: Number(numLat.toFixed(6)),
      longitude: Number(numLng.toFixed(6)),
      area: resolvedArea,
      landmark: resolvedLandmark,
      address: `📍 ${resolvedArea}, (${numLat.toFixed(4)}° N, ${numLng.toFixed(4)}° E)`
    };
    setCoords(updated);
    if (onChange) {
      try { onChange(updated); } catch (e) {}
    }
  };

  // Fetch Live GPS Location on Mount & on Button Click
  const fetchCurrentGpsLocation = async () => {
    setIsLocating(true);
    try {
      const gpsLoc = await locationService.getCurrentLocation();
      if (gpsLoc && typeof gpsLoc.latitude === 'number') {
        const lat = gpsLoc.latitude;
        const lng = gpsLoc.longitude;

        if (leafletMapRef.current && markerRef.current) {
          try {
            leafletMapRef.current.setView([lat, lng], 15);
            markerRef.current.setLatLng([lat, lng]);
          } catch (e) {}
        }

        updateLocationState(lat, lng, gpsLoc.area, gpsLoc.landmark);
      }
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

    const initMap = () => {
      if (!window.L || !mapContainerRef.current) return;

      // Avoid "Map container is already initialized" error
      if (leafletMapRef.current) {
        try { leafletMapRef.current.remove(); } catch (e) {}
        leafletMapRef.current = null;
      }
      if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
        delete mapContainerRef.current._leaflet_id;
      }

      try {
        const defaultLat = coords.latitude;
        const defaultLng = coords.longitude;

        const map = window.L.map(mapContainerRef.current, {
          center: [defaultLat, defaultLng],
          zoom: 14,
          zoomControl: true
        });

        leafletMapRef.current = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '🏢 Leaflet | © OpenStreetMap'
        }).addTo(map);

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
      } catch (err) {
        console.warn('[LEAFLET INIT SAFEGUARD ERROR]', err);
      }
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

    // Safely cleanup map on unmount
    return () => {
      if (leafletMapRef.current) {
        try { leafletMapRef.current.remove(); } catch (e) {}
        leafletMapRef.current = null;
      }
      if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
        delete mapContainerRef.current._leaflet_id;
      }
    };
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

export const LeafletMapPicker = (props) => {
  return (
    <MapErrorBoundary fallback={
      <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-brand-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
          📍 Location Details
        </h3>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
          📍 Area: {props.initialLocation?.area || 'University Sector'}
        </p>
      </div>
    }>
      <LeafletMapPickerInner {...props} />
    </MapErrorBoundary>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, Layers, User, Clock, AlertTriangle, Shield, Wrench } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { resolveImageUrl } from '../utils/imageUtils';

const getTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const diffMs = Math.max(0, now - date);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

export const MapContainer = ({
  issues = [],
  selectedIssue = null,
  onSelectIssue,
  interactive = true,
  height = '560px'
}) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersGroupRef = useRef(null);

  const [activePin, setActivePin] = useState(selectedIssue || issues[0]);

  useEffect(() => {
    if (selectedIssue) {
      setActivePin(selectedIssue);
    } else if (issues.length > 0 && !activePin) {
      setActivePin(issues[0]);
    }
  }, [issues, selectedIssue]);

  // Ensure Leaflet CSS & JS script tags are loaded in head
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initLeafletMap = () => {
      if (!window.L || !mapContainerRef.current || leafletMapRef.current) return;

      const centerLat = issues[0]?.location?.latitude || 17.4225;
      const centerLng = issues[0]?.location?.longitude || 78.4550;

      const map = window.L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true
      });

      leafletMapRef.current = map;

      // Add OpenStreetMap Real Tile Layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '🏢 JanSetu GIS Heatmap | © OpenStreetMap contributors'
      }).addTo(map);

      markersGroupRef.current = window.L.layerGroup().addTo(map);
    };

    if (window.L) {
      initLeafletMap();
    } else if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initLeafletMap();
      document.head.appendChild(script);
    }
  }, []);

  // Update Leaflet Markers when issues or activePin changes
  useEffect(() => {
    if (!window.L || !leafletMapRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    const bounds = [];

    const sampleCoords = [
      { lat: 17.4375, lng: 78.4482, area: 'University Sector / Gate 2' },
      { lat: 17.4225, lng: 78.4550, area: 'Banjara Hills Sector 2' },
      { lat: 17.4080, lng: 78.4735, area: 'Khairatabad Circle' },
      { lat: 17.3950, lng: 78.4890, area: 'Abids Sector 5' },
      { lat: 17.4510, lng: 78.3810, area: 'HITEC City Sector' }
    ];

    issues.forEach((issue, idx) => {
      const fallback = sampleCoords[idx % sampleCoords.length];
      const lat = issue.location?.latitude || fallback.lat;
      const lng = issue.location?.longitude || fallback.lng;
      bounds.push([lat, lng]);

      const isCritical = issue.severity === 'CRITICAL' || issue.priority >= 90;
      const isSelected = (activePin?.issueId || activePin?._id || activePin?.id) === (issue.issueId || issue._id || issue.id);

      const colorHex = isCritical ? '#DC2626' : (issue.status === 'RESOLVED' ? '#16A34A' : (issue.status === 'IN_PROGRESS' || issue.status === 'ASSIGNED' ? '#F59E0B' : '#2563EB'));

      // Custom Leaflet DivIcon for pins
      const customIcon = window.L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="background-color: #0F172A; color: #FFFFFF; font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; border-radius: 4px; border: 1px solid ${colorHex}; white-space: nowrap; margin-bottom: 2px; boxShadow: 0 2px 8px rgba(0,0,0,0.3);">
              ${issue.issueId || `ISSUE-${idx + 1}`}
            </div>
            <div style="width: ${isSelected ? '34px' : '28px'}; height: ${isSelected ? '34px' : '28px'}; border-radius: 50%; background-color: ${colorHex}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; border: 2px solid #FFFFFF; box-shadow: 0 4px 14px ${colorHex}AA; transition: all 0.2s ease;">
              <svg width="${isSelected ? '20' : '16'}" height="${isSelected ? '20' : '16'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [38, 50],
        iconAnchor: [19, 50]
      });

      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(markersGroupRef.current);

      // Construct Rich Hover Tooltip Card Content
      const reporterName = issue.reporter?.name || 'Citizen';
      const reporterPhone = issue.reporter?.mobile ? ` (+91 ${issue.reporter.mobile})` : '';
      const timeAgo = getTimeAgo(issue.createdAt);
      const workerHtml = issue.assignedWorker?.name
        ? `<div style="color: #059669; font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 4px;">👷 Assigned: ${issue.assignedWorker.name} (${issue.assignedWorker.role || 'Field Tech'})</div>`
        : `<div style="color: #DC2626; font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 4px;">⚠️ Worker: Unassigned (Action Required)</div>`;

      const tooltipContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 10px; min-width: 250px; max-width: 300px; line-height: 1.4; color: #0F172A;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; font-family: monospace; color: #2563EB; background: #EFF6FF; padding: 2px 6px; border-radius: 4px;">
              ${issue.issueId || 'ISSUE'}
            </span>
            <span style="font-size: 10px; font-weight: 800; color: ${isCritical ? '#DC2626' : '#D97706'}; background: ${isCritical ? '#FEE2E2' : '#FEF3C7'}; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${issue.severity || 'HIGH'} • ${issue.priority || 85}/100
            </span>
          </div>

          <strong style="font-size: 13px; color: #0F172A; display: block; margin-bottom: 6px; line-height: 1.3;">
            ${issue.title || issue.summary || 'Civic Problem'}
          </strong>

          <div style="font-size: 11px; color: #475569; display: flex; flex-direction: column; gap: 3px;">
            <div>👤 <strong>Complained By:</strong> ${reporterName}${reporterPhone}</div>
            <div>🕒 <strong>When:</strong> ${timeAgo}</div>
            <div>🏢 <strong>Dept:</strong> ${issue.department || 'Municipal Services'}</div>
            ${workerHtml}
          </div>
        </div>
      `;

      // Bind Sticky Hover Tooltip
      marker.bindTooltip(tooltipContent, {
        sticky: true,
        direction: 'top',
        opacity: 1
      });

      marker.on('click', () => {
        setActivePin(issue);
        if (onSelectIssue) onSelectIssue(issue);
        leafletMapRef.current.panTo([lat, lng]);
      });
    });

    if (bounds.length > 0 && leafletMapRef.current) {
      if (bounds.length === 1) {
        leafletMapRef.current.setView(bounds[0], 14);
      } else {
        leafletMapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [issues, activePin]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        backgroundColor: '#E2E8F0',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--color-border-default)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {/* Real OpenStreetMap Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Top Left Overlay Badge */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', gap: '8px' }}>
        <div style={{ backgroundColor: 'var(--color-bg-surface-glass)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(12px)' }}>
          <Compass size={14} className="animate-spin" style={{ animationDuration: '10s' }} />
          <span>Real OpenStreetMap GIS Grid</span>
        </div>
      </div>

      {/* Top Right Heatmap Badge */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
        <div style={{ backgroundColor: 'var(--color-bg-surface-glass)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(12px)' }}>
          <Layers size={14} color="var(--color-brand-primary)" />
          <span>Live Coordinates Active ({issues.length} Issues)</span>
        </div>
      </div>

      {/* Active Pin Details Footer Card */}
      {activePin && (
        <div
          className="animate-slide-up"
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            backgroundColor: 'var(--color-bg-surface-glass)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            backdropFilter: 'blur(16px)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px', flexWrap: 'wrap' }}>
              <PriorityBadge priority={activePin.severity || activePin.priorityLevel || 'HIGH'} />
              <StatusBadge status={activePin.status || 'REPORTED'} />
              <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontWeight: 800 }}>
                Score {activePin.priority || 85}/100
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {getTimeAgo(activePin.createdAt)}
              </span>
            </div>

            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activePin.title || activePin.summary}
            </h4>

            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span>📍 {activePin.location?.area || activePin.location?.address || 'Municipal Sector Area'}</span>
              <span>👤 <strong>By:</strong> {activePin.reporter?.name || 'Citizen'} {activePin.reporter?.mobile ? `(+91 ${activePin.reporter.mobile})` : ''}</span>
              {activePin.assignedWorker?.name ? (
                <span style={{ color: 'var(--status-resolved)', fontWeight: 700 }}>👷 Worker: {activePin.assignedWorker.name} ({activePin.assignedWorker.role || 'Tech'})</span>
              ) : (
                <span style={{ color: 'var(--color-status-danger)', fontWeight: 700 }}>⚠️ Worker: Unassigned</span>
              )}
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              const targetId = activePin.issueId || activePin._id || activePin.id;
              if (onSelectIssue) onSelectIssue(activePin);
              else window.location.hash = `/authority/issues/${targetId}`;
            }}
          >
            Track & Manage Issue ➔
          </button>
        </div>
      )}
    </div>
  );
};

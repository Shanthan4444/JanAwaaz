import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';

export const LocationCard = ({ location }) => {
  const area = location?.area || 'Sector 14';
  const landmark = location?.landmark || 'Near Gate 2';
  const address = location?.address || `${landmark}, ${area}, New Delhi`;
  const lat = location?.latitude || 28.5355;
  const lng = location?.longitude || 77.3910;

  const handleOpenMap = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card style={{ backgroundColor: 'var(--color-bg-surface-elevated)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <MapPin size={18} style={{ color: 'var(--color-brand-primary)' }} />
          <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            WHERE IS THE ISSUE?
          </h4>
        </div>
        <Button variant="ghost" size="sm" icon={ExternalLink} onClick={handleOpenMap}>
          VIEW LOCATION
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: 'var(--font-xs)' }}>
        <div style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
          {area} {landmark ? `(${landmark})` : ''}
        </div>
        <div style={{ color: 'var(--color-text-secondary)' }}>
          {address}
        </div>
        <div style={{ fontFamily: 'monospace', color: 'var(--color-text-tertiary)', fontSize: '11px', marginTop: '2px' }}>
          GPS: {lat}, {lng}
        </div>
      </div>
    </Card>
  );
};

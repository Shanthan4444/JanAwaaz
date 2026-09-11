import React, { useState } from 'react';
import { Camera, Upload, Check, Image as ImageIcon } from 'lucide-react';
import { FileUpload } from '../../shared/components/FileUpload';

const PRESET_EVIDENCE = [
  {
    name: 'Road Repair Completed',
    url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    caption: 'Road patched and surface leveled'
  },
  {
    name: 'Pipeline Valve Shut & Repaired',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    caption: 'Water pipe sealed and pressurized'
  },
  {
    name: 'Garbage Cleared',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    caption: 'Waste cleared and area disinfected'
  }
];

export const EvidenceUploader = ({ onEvidenceChange }) => {
  const [selectedUrl, setSelectedUrl] = useState(PRESET_EVIDENCE[0].url);
  const [caption, setCaption] = useState(PRESET_EVIDENCE[0].caption);

  const handleSelectPreset = (item) => {
    setSelectedUrl(item.url);
    setCaption(item.caption);
    onEvidenceChange([{ type: 'image', url: item.url, caption: item.caption }]);
  };

  const handleFileUpload = (files) => {
    if (files && files.length > 0) {
      const fileUrl = files[0];
      setSelectedUrl(fileUrl);
      onEvidenceChange([{ type: 'image', url: fileUrl, caption: caption || 'On-site resolution photo' }]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Resolution Photo Proof <span style={{ color: 'var(--color-status-danger)' }}>*</span>
      </label>

      {/* Upload Box */}
      <FileUpload
        label="Upload On-Site Photo Proof"
        onFilesSelected={handleFileUpload}
      />

      {/* Preset Quick Proof Options for Hackathon/Field Demo */}
      <div style={{ marginTop: 'var(--space-2)' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 700 }}>
          Or select field camera proof:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)', marginTop: '6px' }}>
          {PRESET_EVIDENCE.map((item, idx) => {
            const isSelected = selectedUrl === item.url;
            return (
              <div
                key={idx}
                onClick={() => handleSelectPreset(item)}
                style={{
                  position: 'relative',
                  height: '70px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)'
                }}
              >
                <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'var(--color-brand-primary)',
                      color: '#FFF',
                      borderRadius: '50%',
                      padding: '2px'
                    }}
                  >
                    <Check size={12} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

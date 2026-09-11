import React, { useState } from 'react';
import { FileUpload } from '../../shared/components/FileUpload';

export const EvidenceUploader = ({ onEvidenceChange }) => {
  const [caption] = useState('On-site resolution photo');

  const handleFileUpload = (files) => {
    if (files && files.length > 0) {
      const fileUrl = files[0];
      onEvidenceChange([{ type: 'image', url: fileUrl, caption: 'On-site resolution photo' }]);
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

    </div>
  );
};

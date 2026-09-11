import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

export const LanguageSelector = () => {
  const { currentLang, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', badge: 'EN' },
    { code: 'hi', label: 'हिन्दी', badge: 'हिन्दी (Hindi)' },
    { code: 'ta', label: 'தமிழ்', badge: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు', badge: 'తెలుగు (Telugu)' },
    { code: 'kn', label: 'ಕನ್ನಡ', badge: 'ಕನ್ನಡ (Kannada)' }
  ];

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--color-bg-surface-elevated)',
          border: '1px solid var(--color-border-default)',
          padding: '8px 14px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--font-xs)',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all var(--transition-fast)'
        }}
        title="Select Language / மொழியைத் தேர்ந்தெடுக்கவும் / భాషను ఎంచుకోండి / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ"
      >
        <Globe size={14} style={{ color: 'var(--color-brand-primary)' }} />
        <span>{activeLangObj.label}</span>
        <ChevronDown size={14} style={{ color: 'var(--color-text-tertiary)' }} />
      </button>

      {isOpen && (
        <div
          className="animate-slide-up"
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            width: '170px',
            backgroundColor: 'var(--color-bg-surface-elevated)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 200,
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '8px 12px', fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border-subtle)', fontWeight: 700 }}>
            Select Language
          </div>

          {languages.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: isSelected ? 'var(--color-brand-subtle)' : 'transparent',
                  border: 'none',
                  color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>{lang.label}</span>
                {isSelected && <span style={{ fontSize: '10px', color: 'var(--color-brand-primary)' }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { XCircle, CheckCircle2, ArrowDown, Sparkles } from 'lucide-react';
import { useTranslation } from '../../shared/i18n/LanguageContext';

export const BeforeWithJanAwaaz = () => {
  const { t } = useTranslation();

  const withoutJanAwaaz = [
    t('w1'),
    t('w2'),
    t('w3'),
    t('w4'),
    t('w5')
  ];

  const withJanAwaaz = [
    t('j1'),
    t('j2'),
    t('j3'),
    t('j4'),
    t('j5')
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
      {/* Without JanAwaaz */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid rgba(225, 29, 72, 0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)', color: 'var(--status-reopened)' }}>
          <XCircle size={20} />
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800 }}>{t('withoutJanAwaaz')}</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {withoutJanAwaaz.map((step, idx) => (
            <React.Fragment key={idx}>
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-app)', border: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-tertiary)' }}>{idx + 1}.</span>
                <span>{step}</span>
              </div>
              {idx < withoutJanAwaaz.length - 1 && (
                <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', margin: '-4px 0' }}>
                  ↓
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* With JanAwaaz */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-surface-elevated)',
          border: '1px solid var(--color-brand-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-glow-indigo)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)', color: 'var(--status-resolved)' }}>
          <CheckCircle2 size={20} />
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)' }}>{t('withJanAwaaz')}</h3>
          <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', marginLeft: 'auto' }}>
            <Sparkles size={12} /> {t('activeNetwork')}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {withJanAwaaz.map((step, idx) => (
            <React.Fragment key={idx}>
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-brand-border)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, color: 'var(--color-brand-primary)' }}>{idx + 1}.</span>
                <span>{step}</span>
              </div>
              {idx < withJanAwaaz.length - 1 && (
                <div style={{ textAlign: 'center', color: 'var(--color-brand-primary)', margin: '-4px 0' }}>
                  ↓
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

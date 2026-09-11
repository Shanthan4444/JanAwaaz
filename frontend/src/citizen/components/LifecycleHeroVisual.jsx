import React, { useState } from 'react';
import { Cpu, Users, Shield, Wrench, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../../shared/i18n/LanguageContext';

export const LifecycleHeroVisual = () => {
  const { t } = useTranslation();
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    { title: t('stage1'), icon: '🚧', desc: t('stage1Desc') },
    { title: t('stage2'), icon: Cpu, desc: t('stage2Desc') },
    { title: t('stage3'), icon: Users, desc: t('stage3Desc') },
    { title: t('stage4'), icon: Wrench, desc: t('stage4Desc') },
    { title: t('stage5'), icon: CheckCircle2, desc: t('stage5Desc') }
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', marginBottom: 'var(--space-2)' }}>
            <Sparkles size={12} /> {t('productLifecycle')}
          </span>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {t('movementHeader')}
          </h3>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {stages.map((stg, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStage(idx)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeStage === idx ? 'var(--color-brand-primary)' : 'var(--color-bg-surface-elevated)',
                color: activeStage === idx ? '#FFFFFF' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-default)',
                fontSize: 'var(--font-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Stage {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', position: 'relative' }}>
        {stages.map((stage, idx) => {
          const IconComp = typeof stage.icon === 'string' ? null : stage.icon;
          const isActive = idx === activeStage;
          const isPassed = idx < activeStage;

          return (
            <div
              key={idx}
              style={{
                backgroundColor: isActive
                  ? 'var(--color-bg-surface-elevated)'
                  : isPassed
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'var(--color-bg-app)',
                border: `1px solid ${isActive ? 'var(--color-brand-primary)' : isPassed ? 'var(--status-resolved)' : 'var(--color-border-subtle)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                transition: 'all var(--transition-normal)'
              }}
            >
              <div style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: isActive ? 'var(--color-brand-primary)' : isPassed ? 'var(--status-resolved)' : 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)' }}>
                0{idx + 1} {stage.title}
              </div>

              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: isActive ? 'var(--color-brand-subtle)' : 'rgba(255,255,255,0.05)', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: 'var(--space-3)' }}>
                {IconComp ? <IconComp size={20} /> : stage.icon}
              </div>

              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {stage.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

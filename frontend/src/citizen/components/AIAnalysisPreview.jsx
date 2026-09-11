import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle, Clock } from 'lucide-react';

export const AIAnalysisPreview = ({
  category = 'Road Damage',
  department = 'Roads & Infrastructure',
  severity = 'High',
  priority = 91,
  duplicateRisk = 'Low'
}) => {
  const [stepState, setStepState] = useState(0);

  const processingSteps = [
    'Reading your description & location',
    'Identifying issue category & scope',
    'Assessing severity score (0-100)',
    'Finding responsible department',
    'Checking nearby duplicate reports'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepState((prev) => {
        if (prev < processingSteps.length) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const isComplete = stepState >= processingSteps.length;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-surface-elevated)',
        border: '1px solid var(--color-brand-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-glow-indigo)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)' }}>
          <Cpu size={24} className={!isComplete ? 'animate-spin' : ''} style={{ animationDuration: '6s' }} />
        </div>
        <div>
          <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {!isComplete ? 'UNDERSTANDING YOUR REPORT...' : 'JanAwaaz AI Analysis Complete'}
          </h4>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
            Civic Intelligence Diagnostic Output
          </span>
        </div>
      </div>

      {!isComplete ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {processingSteps.map((st, idx) => {
            const isDone = idx < stepState;
            const isCurrent = idx === stepState;

            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-xs)' }}>
                {isDone ? (
                  <CheckCircle size={14} style={{ color: 'var(--status-resolved)' }} />
                ) : isCurrent ? (
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--color-brand-primary)', borderTopColor: 'transparent', animation: 'pulseGlow 0.8s infinite linear', display: 'inline-block' }} />
                ) : (
                  <Clock size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                )}
                <span style={{ color: isDone || isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', fontWeight: isCurrent ? 700 : 500 }}>
                  {st}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
          <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>CATEGORY</span>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>{category}</p>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>DEPARTMENT</span>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-brand-primary)', marginTop: '2px' }}>{department}</p>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>SEVERITY</span>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: severity === 'Critical' ? 'var(--priority-critical)' : 'var(--priority-high)', marginTop: '2px' }}>{severity}</p>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>PRIORITY SCORE</span>
            <p style={{ fontSize: 'var(--font-lg)', fontWeight: 900, color: 'var(--status-resolved)', marginTop: '2px' }}>{priority} / 100</p>
          </div>
        </div>
      )}
    </div>
  );
};

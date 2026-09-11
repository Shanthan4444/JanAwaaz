import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  title = 'No issues found',
  description = 'There are currently no active civic issues matching your filter criteria.',
  actionText,
  onAction,
  icon: Icon = Inbox
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-4)',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px dashed var(--color-border-default)',
        borderRadius: 'var(--radius-xl)'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-brand-subtle)',
          color: 'var(--color-brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)'
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', maxWidth: '420px', marginBottom: actionText ? 'var(--space-6)' : 0 }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
};

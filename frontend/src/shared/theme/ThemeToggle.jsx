import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '38px',
        height: '38px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-bg-surface-elevated)',
        border: '1px solid var(--color-border-default)',
        color: isDark ? '#F59E0B' : 'var(--color-text-primary)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        padding: 0
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-hover)';
        e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-default)';
        e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-elevated)';
      }}
    >
      {isDark ? (
        <Sun size={18} style={{ transition: 'transform 0.3s ease', transform: 'rotate(0deg)' }} />
      ) : (
        <Moon size={18} style={{ transition: 'transform 0.3s ease', transform: 'rotate(0deg)' }} />
      )}
    </button>
  );
};

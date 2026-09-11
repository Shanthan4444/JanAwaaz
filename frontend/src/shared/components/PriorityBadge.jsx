import React from 'react';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export const PriorityBadge = ({ priority = 'MEDIUM', className = '' }) => {
  const p = String(priority).toUpperCase();

  const getPriorityConfig = (level) => {
    switch (level) {
      case 'CRITICAL':
        return { label: 'CRITICAL PRIORITY', class: 'priority-badge-critical', icon: ShieldAlert };
      case 'HIGH':
        return { label: 'HIGH PRIORITY', class: 'priority-badge-high', icon: AlertTriangle };
      case 'LOW':
        return { label: 'LOW PRIORITY', class: 'priority-badge-low', icon: Info };
      case 'MEDIUM':
      default:
        return { label: 'MEDIUM PRIORITY', class: 'priority-badge-medium', icon: AlertCircle };
    }
  };

  const config = getPriorityConfig(p);
  const Icon = config.icon;

  return (
    <span className={`badge ${config.class} ${className}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

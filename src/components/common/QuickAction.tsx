import React from 'react';
import './QuickAction.css';

interface QuickActionProps {
  label: string;
  icon: string;
  action: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function QuickAction({ label, icon, action, disabled, onClick }: QuickActionProps) {
  return (
    <button
      className={`quick-action ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <span className="action-icon">{icon}</span>
      <span className="action-label">{label}</span>
    </button>
  );
}
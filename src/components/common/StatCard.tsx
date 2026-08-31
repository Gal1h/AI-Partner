import React from 'react';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="stat-card" style={{ borderColor: `${color}40` }}>
      <div className="stat-icon" style={{ background: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-content">
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
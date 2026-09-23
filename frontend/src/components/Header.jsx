import React, { useState, useEffect } from 'react';
import { IconCpu, IconSparkles, IconRadio, IconLayers } from './Icons';

export default function Header({ currentTheme, onThemeChange, isGridActive, onToggleGrid }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const themes = [
    { id: 'cyan', name: 'CYAN-01', color: '#00e5ff' },
    { id: 'quantum', name: 'QUANTUM', color: '#c084fc' },
    { id: 'solar', name: 'SOLAR', color: '#f59e0b' },
    { id: 'emerald', name: 'EMERALD', color: '#10b981' },
  ];

  return (
    <header className="header-hud glass-panel">
      <div className="header-brand">
        <div className="brand-icon-wrapper">
          <IconCpu size={26} className="brand-icon glow-text" />
          <div className="brand-pulse-ring" />
        </div>
        <div className="brand-text">
          <div className="brand-title">
            <span className="brand-name">J.A.R.V.I.S.</span>
            <span className="brand-version mono-badge">v4.8.2 NEURAL</span>
          </div>
          <p className="brand-sub">JUST A RATHER VERY INTELLIGENT SYSTEM</p>
        </div>
      </div>

      <div className="header-center">
        <div className="status-indicator">
          <span className="pulse-dot" />
          <span className="status-label">SYS.ONLINE</span>
        </div>
        <div className="telemetry-chip">
          <span className="chip-label">LATENCY:</span>
          <span className="chip-value">4.2ms</span>
        </div>
        <div className="telemetry-chip">
          <span className="chip-label">CORE CLK:</span>
          <span className="chip-value mono-badge">{time}</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Grid HUD Toggle */}
        <button
          className={`action-btn-icon ${isGridActive ? 'active' : ''}`}
          onClick={onToggleGrid}
          title="Toggle Holographic Grid HUD"
        >
          <IconLayers size={18} />
        </button>

        {/* Theme Selectors */}
        <div className="theme-selector-group">
          {themes.map(t => (
            <button
              key={t.id}
              className={`theme-pill ${currentTheme === t.id ? 'selected' : ''}`}
              onClick={() => onThemeChange(t.id)}
              style={{ '--theme-color': t.color }}
              title={`Switch Theme: ${t.name}`}
            >
              <span className="theme-dot" style={{ backgroundColor: t.color }} />
              <span className="theme-text">{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

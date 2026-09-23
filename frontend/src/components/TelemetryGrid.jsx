import React, { useState, useEffect } from 'react';
import { IconCpu, IconDatabase, IconActivity, IconShield, IconRadio } from './Icons';

export default function TelemetryGrid({ isOverdrive }) {
  const [metrics, setMetrics] = useState({
    cpuLoad: 42,
    memoryUsage: 3.4,
    neuralSync: 98.7,
    threatLevel: 'DEFCON 5 // LOW',
    uplinkSpeed: 1420
  });

  // Simulated live fluctuating telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpuLoad: Math.min(100, Math.max(15, prev.cpuLoad + (Math.floor(Math.random() * 7) - 3) + (isOverdrive ? 20 : 0))),
        memoryUsage: +(prev.memoryUsage + (Math.random() * 0.08 - 0.04)).toFixed(2),
        neuralSync: +(Math.min(100, Math.max(92, prev.neuralSync + (Math.random() * 0.4 - 0.2)))).toFixed(1),
        threatLevel: isOverdrive ? 'DEFCON 4 // ELEVATED' : 'DEFCON 5 // LOW',
        uplinkSpeed: Math.floor(prev.uplinkSpeed + (Math.random() * 60 - 30) + (isOverdrive ? 400 : 0))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isOverdrive]);

  const cards = [
    {
      title: 'SYNAPSE PROCESSOR',
      value: `${metrics.cpuLoad}%`,
      sub: '32 Cores // 6.4 GHz',
      percent: metrics.cpuLoad,
      icon: <IconCpu size={18} className="glow-text" />,
      colorClass: metrics.cpuLoad > 75 ? 'danger' : metrics.cpuLoad > 55 ? 'warning' : 'optimal'
    },
    {
      title: 'QUANTUM RAM ARRAY',
      value: `${metrics.memoryUsage} TB`,
      sub: 'Allocated / 16 TB Pool',
      percent: (metrics.memoryUsage / 16) * 100,
      icon: <IconDatabase size={18} className="glow-text" />,
      colorClass: 'optimal'
    },
    {
      title: 'NEURAL LINK SYNC',
      value: `${metrics.neuralSync}%`,
      sub: 'Bi-directional Holographic',
      percent: metrics.neuralSync,
      icon: <IconActivity size={18} className="glow-text" />,
      colorClass: 'optimal'
    },
    {
      title: 'QUANTUM UPLINK',
      value: `${metrics.uplinkSpeed} Gb/s`,
      sub: 'Sub-space Node 09-X',
      percent: Math.min(100, (metrics.uplinkSpeed / 2500) * 100),
      icon: <IconRadio size={18} className="glow-text" />,
      colorClass: 'optimal'
    }
  ];

  return (
    <div className="telemetry-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="telemetry-card glass-panel">
          <div className="telemetry-card-header">
            <span className="telemetry-title">{card.title}</span>
            <div className="telemetry-icon-box">{card.icon}</div>
          </div>
          <div className="telemetry-card-body">
            <div className="telemetry-value-row">
              <span className="telemetry-val glow-text">{card.value}</span>
              <span className="telemetry-sub">{card.sub}</span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${card.colorClass}`}
                style={{ width: `${Math.min(100, Math.max(5, card.percent))}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

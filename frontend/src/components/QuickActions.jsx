import React, { useState } from 'react';
import { IconSparkles, IconRefresh, IconLayers, IconActivity } from './Icons';

export default function QuickActions({ onTriggerAction }) {
  const [runningAction, setRunningAction] = useState(null);

  const actions = [
    { id: 'diag', label: 'FULL DIAGNOSTIC', desc: 'Scan all 256 sub-clusters', icon: <IconActivity size={18} /> },
    { id: 'purge', label: 'PURGE MEM BUFFER', desc: 'Reclaim 4.8 TB temporary heap', icon: <IconRefresh size={18} /> },
    { id: 'calibrate', label: 'CALIBRATE SENSORS', desc: 'Realign neural focal array', icon: <IconSparkles size={18} /> },
    { id: 'cluster', label: 'REBALANCE THREADS', desc: 'Even out distributed loads', icon: <IconLayers size={18} /> },
  ];

  const handleRun = (action) => {
    setRunningAction(action.id);
    onTriggerAction(action.id);
    setTimeout(() => {
      setRunningAction(null);
    }, 1200);
  };

  return (
    <div className="quick-actions-panel glass-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <IconSparkles size={18} className="glow-text" />
          <span className="panel-title">QUICK OPERATIONS // DISPATCH</span>
        </div>
        <span className="mono-badge">INSTANT EXECUTION</span>
      </div>

      <div className="quick-action-grid">
        {actions.map(act => (
          <button
            key={act.id}
            className={`quick-action-card ${runningAction === act.id ? 'running' : ''}`}
            onClick={() => handleRun(act)}
            disabled={runningAction !== null}
          >
            <div className="action-card-icon">
              {act.icon}
            </div>
            <div className="action-card-text">
              <span className="action-card-label">{act.label}</span>
              <span className="action-card-desc">
                {runningAction === act.id ? 'EXECUTING TASK...' : act.desc}
              </span>
            </div>
            {runningAction === act.id && <span className="action-spinner" />}
          </button>
        ))}
      </div>
    </div>
  );
}

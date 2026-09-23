import React, { useState } from 'react';
import { IconShield, IconRadio, IconActivity, IconSparkles } from './Icons';

export default function ProtocolMatrix() {
  const [protocols, setProtocols] = useState([
    { id: 'p1', name: 'QUANTUM ENCRYPTION', desc: '4096-bit lattice defense active', active: true, icon: <IconShield size={16} /> },
    { id: 'p2', name: 'SENTINEL DEFENSE GRID', desc: 'Autonomous intrusion deterrence', active: true, icon: <IconShield size={16} /> },
    { id: 'p3', name: 'HOLOGRAPHIC PROJECTION', desc: 'Volumetric real-time rendering', active: false, icon: <IconSparkles size={16} /> },
    { id: 'p4', name: 'SUBSPACE DEEP SCAN', desc: 'Continuous wide-spectrum survey', active: true, icon: <IconRadio size={16} /> },
  ]);

  const toggleProtocol = (id) => {
    setProtocols(prev =>
      prev.map(p => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  return (
    <div className="protocol-matrix-panel glass-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <IconShield size={18} className="glow-text" />
          <span className="panel-title">SYSTEM PROTOCOLS // MATRIX</span>
        </div>
        <span className="mono-badge">
          {protocols.filter(p => p.active).length} / {protocols.length} ACTIVE
        </span>
      </div>

      <div className="protocol-list">
        {protocols.map(p => (
          <div
            key={p.id}
            className={`protocol-item ${p.active ? 'active' : ''}`}
            onClick={() => toggleProtocol(p.id)}
          >
            <div className="protocol-icon-wrapper">
              {p.icon}
            </div>
            <div className="protocol-info">
              <span className="protocol-name">{p.name}</span>
              <span className="protocol-desc">{p.desc}</span>
            </div>
            <div className="protocol-switch">
              <div className={`switch-toggle ${p.active ? 'on' : 'off'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CoreReactor from './components/CoreReactor';
import TelemetryGrid from './components/TelemetryGrid';
import CommandConsole from './components/CommandConsole';
import ProtocolMatrix from './components/ProtocolMatrix';
import QuickActions from './components/QuickActions';
import NeuralVisualizer from './components/NeuralVisualizer';
import { useVoiceController } from './hooks/useVoiceController';
import { IconActivity, IconRadio, IconTerminal } from './components/Icons';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState('cyan');
  const [isGridActive, setIsGridActive] = useState(true);
  const [isOverdrive, setIsOverdrive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((text) => {
    setNotification(text);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  // Handle triggered system operations
  const handleTriggerAction = useCallback((actionKey) => {
    setIsAnalyzing(true);
    if (actionKey === 'scan') {
      showNotification('Neural Subspace Scan initialized. Sampling 10,000 node points.');
    } else if (actionKey === 'optimize') {
      showNotification('Cache buffers purged. Memory latency reduced.');
    } else if (actionKey === 'diag') {
      showNotification('Diagnostics running across all core clusters. All 256 threads green.');
    } else if (actionKey === 'purge') {
      showNotification('Memory buffer cleared. 4.8 TB reclaimed.');
    } else if (actionKey === 'calibrate') {
      showNotification('Sensor calibration verified against Earth magnetic field.');
    } else if (actionKey === 'cluster') {
      showNotification('Threads re-allocated evenly across cores.');
    }

    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  }, [showNotification]);

  const handleToggleOverdrive = useCallback(() => {
    setIsOverdrive(prev => {
      const next = !prev;
      showNotification(next ? '⚠️ NEURAL OVERDRIVE ENGAGED!' : 'Neural Overdrive Disengaged. Baseline restored.');
      return next;
    });
  }, [showNotification]);

  // Voice Command Handler
  const handleVoiceCommand = useCallback((cmd) => {
    if (cmd.type === 'overdrive') {
      setIsOverdrive(cmd.value);
      showNotification(cmd.message);
    } else if (cmd.type === 'theme') {
      setTheme(cmd.value);
      showNotification(cmd.message);
    } else if (cmd.type === 'action') {
      handleTriggerAction(cmd.value);
    } else if (cmd.type === 'grid') {
      setIsGridActive(cmd.value);
      showNotification(cmd.message);
    }
  }, [handleTriggerAction, showNotification]);

  // Hook for voice reactivity, mic input, and speech recognition
  const voice = useVoiceController({ onCommand: handleVoiceCommand });

  // Apply theme to document body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply grid HUD to document body
  useEffect(() => {
    if (isGridActive) {
      document.body.classList.add('grid-active');
    } else {
      document.body.classList.remove('grid-active');
    }
  }, [isGridActive]);

  return (
    <div className="app-container">
      {/* Toast Notification HUD */}
      {notification && (
        <div className="hud-toast glass-panel">
          <IconActivity size={18} className="glow-text animate-spin-slow" />
          <span className="toast-text">{notification}</span>
        </div>
      )}

      {/* Top Header Navigation HUD */}
      <Header
        currentTheme={theme}
        onThemeChange={setTheme}
        isGridActive={isGridActive}
        onToggleGrid={() => setIsGridActive(!isGridActive)}
      />

      {/* Main Grid Workspace */}
      <main className="main-workspace">
        {/* Left Column: Core Reactor (3D Voice Plasma Sphere) & Protocol Matrix */}
        <section className="column col-left">
          <CoreReactor
            isOverdrive={isOverdrive}
            onToggleOverdrive={handleToggleOverdrive}
            theme={theme}
            audioLevel={voice.audioLevel}
            isTalking={voice.isTalking}
            isMicActive={voice.isMicActive}
            frequencyBands={voice.frequencyBands}
            transcript={voice.transcript}
            lastAction={voice.lastAction}
            isSimulating={voice.isSimulating}
            onToggleMic={voice.toggleMic}
            onToggleSimulation={voice.toggleSimulation}
            onSimulatePulse={voice.simulateSinglePulse}
          />
          <ProtocolMatrix />
        </section>

        {/* Center & Right Area: Telemetry, Visualizer, Console & Quick Actions */}
        <section className="column col-center-right">
          {/* Real-time Telemetry Grid */}
          <TelemetryGrid isOverdrive={isOverdrive} />

          {/* Neural Frequency Canvas Waveform Panel */}
          <div className="visualizer-panel glass-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <IconRadio size={18} className="glow-text" />
                <span className="panel-title">NEURAL FREQUENCY WAVEFORM // AUDIO REACTIVE HUD</span>
              </div>
              <div className="status-badge-group">
                {voice.isTalking && (
                  <span className="mono-badge voice-live-tag">
                    🎙️ VOICE ACTIVE ({Math.round(voice.audioLevel * 100)}%)
                  </span>
                )}
                <span className="mono-badge">
                  {voice.isTalking ? 'VOICE MODULATION' : isAnalyzing ? 'ACTIVE SAMPLING' : 'IDLE HARMONIC'}
                </span>
              </div>
            </div>
            <NeuralVisualizer
              isAnalyzing={isAnalyzing || isOverdrive || voice.isTalking}
              theme={theme}
            />
          </div>

          {/* Bottom Row: Terminal Command Shell + Quick Operations */}
          <div className="bottom-dashboard-grid">
            <CommandConsole
              onTriggerAction={handleTriggerAction}
              onThemeChange={setTheme}
              isOverdrive={isOverdrive}
              onToggleOverdrive={handleToggleOverdrive}
            />
            <QuickActions onTriggerAction={handleTriggerAction} />
          </div>
        </section>
      </main>

      {/* Footer Status Bar */}
      <footer className="footer-hud glass-panel">
        <div className="footer-left">
          <span className="pulse-dot" />
          <span className="footer-status">
            {voice.isMicActive
              ? 'VOICE LINK ACTIVE: REAL-TIME AUDIO SYNCHRONIZED'
              : 'SYSTEM INTEGRITY: 100% NOMINAL'}
          </span>
        </div>
        <div className="footer-center">
          <span>REACT 18 + THREE.JS WEBGL PLASMA CORE // JARVIS OS</span>
        </div>
        <div className="footer-right">
          <span className={`mono-badge ${voice.isMicActive ? 'badge-accent' : ''}`}>
            MIC: {voice.isMicActive ? 'ONLINE' : 'STANDBY'}
          </span>
          <span className="mono-badge">NODE: ONLINE</span>
          <span className="mono-badge">PORT: 3000</span>
        </div>
      </footer>
    </div>
  );
}

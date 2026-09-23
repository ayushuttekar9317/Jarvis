import React, { useState } from 'react';
import PlasmaSphere from './PlasmaSphere';
import { IconPower, IconZap, IconMic, IconMicOff, IconActivity, IconRadio, IconSparkles } from './Icons';

export default function CoreReactor({
  isOverdrive,
  onToggleOverdrive,
  powerEfficiency = 99.4,
  theme = 'cyan',
  audioLevel = 0,
  isTalking = false,
  isMicActive = false,
  frequencyBands = [0, 0, 0, 0, 0, 0, 0, 0],
  transcript = '',
  lastAction = null,
  isSimulating = false,
  onToggleMic,
  onToggleSimulation,
  onSimulatePulse,
}) {
  const [activeMode, setActiveMode] = useState('sphere'); // 'sphere' | 'arc'

  return (
    <div className="core-reactor-panel glass-panel">
      {/* Panel Header with Mode Switcher */}
      <div className="panel-header">
        <div className="panel-title-group">
          <IconZap size={18} className="glow-text" />
          <span className="panel-title">NEURAL CORE // 3D PLASMA SPHERE</span>
        </div>
        <div className="mode-toggle-group">
          <button
            className={`mode-pill ${activeMode === 'sphere' ? 'active' : ''}`}
            onClick={() => setActiveMode('sphere')}
            title="3D Three.js Plasma Sphere"
          >
            3D SPHERE
          </button>
          <button
            className={`mode-pill ${activeMode === 'arc' ? 'active' : ''}`}
            onClick={() => setActiveMode('arc')}
            title="Classic Arc Reactor Ring"
          >
            ARC RING
          </button>
        </div>
      </div>

      {/* Main Core Display */}
      <div className="reactor-display-container">
        {activeMode === 'sphere' ? (
          <div className="sphere-viewport-container">
            <PlasmaSphere
              audioLevel={audioLevel}
              isTalking={isTalking}
              theme={theme}
              isOverdrive={isOverdrive}
              className="jarvis-3d-sphere"
            />

            {/* Floating Voice Indicator Badge */}
            <div className="voice-status-overlay">
              <span className={`voice-pulse-badge ${isTalking ? 'talking' : isMicActive ? 'listening' : 'idle'}`}>
                <span className="pulse-dot-small" />
                {isTalking
                  ? 'VOICE: DETECTED (ANIMATING)'
                  : isMicActive
                  ? 'VOICE: LISTENING...'
                  : isSimulating
                  ? 'SIMULATION ACTIVE'
                  : 'VOICE: STANDBY'}
              </span>
            </div>

            {/* Real-time 8-Band Equalizer Frequency Bars */}
            <div className="sphere-audio-equalizer">
              {frequencyBands.map((val, idx) => (
                <div key={idx} className="eq-bar-track">
                  <div
                    className={`eq-bar-fill ${isTalking ? 'glow' : ''}`}
                    style={{
                      height: `${Math.max(8, val * 100)}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`arc-reactor ${isOverdrive ? 'overdrive' : ''}`}>
            {/* Outer rotating ring */}
            <div className="reactor-ring outer-ring" />
            {/* Segmented mid ring */}
            <div className="reactor-ring mid-ring" />
            {/* Inner counter-rotating ring */}
            <div className="reactor-ring inner-ring" />

            {/* Core center glowing emitter */}
            <div className="core-emitter">
              <div className="emitter-glow" />
              <div className="emitter-core">
                <span className="core-value">{isOverdrive ? '128%' : `${powerEfficiency}%`}</span>
                <span className="core-unit">OUTPUT</span>
              </div>
            </div>
          </div>
        )}

        {/* Orbiting HUD markers */}
        <div className="hud-markers">
          <div className="marker marker-top">
            <span className="marker-label">FLUX FLD</span>
            <span className="marker-val">{isOverdrive ? '28.4 T' : '14.8 T'}</span>
          </div>
          <div className="marker marker-bottom">
            <span className="marker-label">AUDIO GAIN</span>
            <span className="marker-val">{Math.round(audioLevel * 100)}%</span>
          </div>
          <div className="marker marker-left">
            <span className="marker-label">STABILITY</span>
            <span className="marker-val">{isOverdrive ? '96.4%' : '99.98%'}</span>
          </div>
          <div className="marker marker-right">
            <span className="marker-label">FREQ</span>
            <span className="marker-val">{isOverdrive ? '4.8 GHz' : '1.2 GHz'}</span>
          </div>
        </div>
      </div>

      {/* Voice Transcript & Command Display */}
      {(transcript || lastAction || isMicActive || isSimulating) && (
        <div className="voice-transcript-panel">
          <div className="transcript-header">
            <IconRadio size={14} className="glow-text animate-pulse" />
            <span>VOICE RECOGNITION HUD</span>
            {isMicActive && <span className="live-mic-tag">● LIVE</span>}
          </div>
          <div className="transcript-content">
            {transcript ? (
              <span className="transcript-quote">"{transcript}"</span>
            ) : isMicActive ? (
              <span className="transcript-placeholder">
                {isTalking
                  ? '"Listening... [Voice detected]"'
                  : '"Listening... Speak commands like \'Hello J.A.R.V.I.S\', \'Scan\', or \'Optimize\'"'}
              </span>
            ) : isSimulating ? (
              <span className="transcript-quote">"Simulating vocal command: 'Jarvis, optimize neural flux...'"</span>
            ) : null}
          </div>
          {lastAction && (
            <div className="action-feedback">
              <span className="feedback-tag">JARVIS:</span>
              <span className="feedback-text">{lastAction}</span>
            </div>
          )}
        </div>
      )}

      {/* Reactor & Voice Controls Bar */}
      <div className="reactor-controls-wrapper">
        <div className="voice-controls-row">
          {/* Microphone Link Toggle */}
          <button
            className={`voice-btn ${isMicActive ? 'btn-mic-active' : 'btn-mic-inactive'}`}
            onClick={onToggleMic}
            title={isMicActive ? 'Stop Microphone' : 'Start Microphone Voice Reactivity'}
          >
            {isMicActive ? (
              <>
                <span className="mic-live-indicator" />
                <IconMic size={16} />
                <span>MIC ONLINE</span>
              </>
            ) : (
              <>
                <IconMic size={16} />
                <span>START VOICE LINK</span>
              </>
            )}
          </button>

          {/* Test Talk / Pulse Button */}
          <button
            className="voice-btn btn-test-pulse"
            onClick={() => {
              if (onSimulatePulse) onSimulatePulse(2500);
            }}
            title="Simulate speaking pulse to animate sphere"
          >
            <IconSparkles size={16} />
            <span>TEST VOICE</span>
          </button>

          {/* Simulation Loop Toggle */}
          <button
            className={`voice-btn btn-sim ${isSimulating ? 'active' : ''}`}
            onClick={onToggleSimulation}
            title="Toggle continuous simulated speech wave"
          >
            <IconActivity size={16} />
            <span>{isSimulating ? 'SIM: ON' : 'SIM: OFF'}</span>
          </button>
        </div>

        {/* Neural Overdrive Toggle */}
        <button
          className={`reactor-btn ${isOverdrive ? 'btn-overdrive active' : 'btn-normal'}`}
          onClick={onToggleOverdrive}
        >
          <IconPower size={16} />
          <span>{isOverdrive ? 'DISENGAGE OVERDRIVE' : 'ENGAGE NEURAL OVERDRIVE'}</span>
        </button>

        {/* Voice Command Hints */}
        <div className="voice-hints">
          <span className="hint-label">VOICE COMMANDS:</span>
          <span className="hint-commands">
            "Overdrive", "Theme Purple", "Theme Solar", "Theme Green", "Scan", "Optimize"
          </span>
        </div>
      </div>
    </div>
  );
}

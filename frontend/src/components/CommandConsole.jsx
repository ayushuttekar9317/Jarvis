import React, { useState, useRef, useEffect } from 'react';
import { IconTerminal, IconSparkles, IconActivity } from './Icons';
import { processJarvisPrompt, resetJarvisMemory } from '../services/jarvisAI';

export default function CommandConsole({ onTriggerAction, onThemeChange, isOverdrive, onToggleOverdrive }) {
  const [logs, setLogs] = useState([
    { id: 1, type: 'system', text: '[INITIALIZING] Jarvis Neural Operating System v4.8.2...', time: '18:10:00' },
    { id: 2, type: 'system', text: '[STATUS] All optical nodes synchronized. Subsystems nominal.', time: '18:10:02' },
    { id: 3, type: 'jarvis', text: 'Good evening. All systems are operational and awaiting your instruction. You may ask me any question or issue system commands.', time: '18:10:03' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const logEndRef = useRef(null);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs, isProcessing]);

  const handleCommand = async (cmdText) => {
    const raw = cmdText.trim();
    if (!raw || isProcessing) return;

    const timestamp = new Date().toLocaleTimeString();
    const userMsgId = Date.now();
    const tempThinkingId = userMsgId + 1;

    // Handle terminal clear locally
    if (raw.toLowerCase() === 'clear') {
      resetJarvisMemory();
      setLogs([{ id: Date.now(), type: 'system', text: '[TERMINAL RESET] Memory cleared. Neural shell ready.', time: timestamp }]);
      setInputVal('');
      return;
    }

    // Add user log and thinking placeholder
    setLogs(prev => [
      ...prev,
      { id: userMsgId, type: 'user', text: `> ${raw}`, time: timestamp },
      { id: tempThinkingId, type: 'jarvis thinking', text: 'Thinking... [Neural Uplink Querying Knowledge Base]', time: timestamp, isThinking: true }
    ]);
    setInputVal('');
    setIsProcessing(true);

    try {
      const result = await processJarvisPrompt(raw, {
        onTriggerAction,
        onThemeChange,
        isOverdrive,
        onToggleOverdrive
      });

      const replyTime = new Date().toLocaleTimeString();

      setLogs(prev => prev.map(log => {
        if (log.id === tempThinkingId) {
          return {
            id: tempThinkingId,
            type: 'jarvis',
            text: result.reply,
            time: replyTime,
            isThinking: false
          };
        }
        return log;
      }));
    } catch (err) {
      console.error('Command processing error:', err);
      setLogs(prev => prev.map(log => {
        if (log.id === tempThinkingId) {
          return {
            id: tempThinkingId,
            type: 'jarvis',
            text: 'Apologies, sir. An unexpected error occurred while processing your request.',
            time: new Date().toLocaleTimeString(),
            isThinking: false
          };
        }
        return log;
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommand(inputVal);
    }
  };

  const quickPrompts = [
    'Who are you?',
    "What's the time in U.S?",
    'Scan',
    'Optimize',
    'What is Quantum Computing?',
    'Help'
  ];

  return (
    <div className="command-console glass-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <IconTerminal size={18} className="glow-text" />
          <span className="panel-title">TERMINAL // NEURAL PROMPT INTERACTION</span>
        </div>
        <div className="status-badge-group">
          {isProcessing ? (
            <span className="mono-badge badge-accent animate-pulse">NEURAL AI: THINKING...</span>
          ) : (
            <span className="mono-badge">AI SHELL: ACTIVE</span>
          )}
        </div>
      </div>

      <div className="console-feed">
        {logs.map(log => (
          <div key={log.id} className={`console-line ${log.type}`}>
            <span className="log-time">[{log.time}]</span>
            <span className="log-prefix">
              {log.type === 'user' ? 'USR ' : log.type.includes('jarvis') ? 'JARVIS: ' : 'SYS: '}
            </span>
            <div className="log-message">
              {log.isThinking ? (
                <span className="thinking-indicator">
                  <span className="thinking-spinner" />
                  <span>Processing neural query...</span>
                </span>
              ) : (
                <div className="log-text-content">
                  {log.text.split('\n').map((line, idx) => (
                    <p key={idx} className="log-paragraph">{line || '\u00A0'}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Quick Action Pill Row */}
      <div className="quick-prompt-row">
        <span className="quick-prompt-label">SUGGESTED:</span>
        {quickPrompts.map(p => (
          <button
            key={p}
            className="quick-prompt-btn"
            onClick={() => handleCommand(p)}
            disabled={isProcessing}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="console-input-row">
        <span className="prompt-arrow">&gt;</span>
        <input
          type="text"
          className="console-input"
          placeholder="Ask anything (e.g., 'What is the time in US?', 'Describe about you', 'Scan', 'Optimize')..."
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
        />
        <button
          className={`console-send-btn ${isProcessing ? 'loading' : ''}`}
          onClick={() => handleCommand(inputVal)}
          disabled={isProcessing || !inputVal.trim()}
        >
          {isProcessing ? 'THINKING...' : 'EXECUTE'}
        </button>
      </div>
    </div>
  );
}

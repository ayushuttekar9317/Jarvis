import { useState, useEffect, useRef, useCallback } from 'react';
import { processJarvisPrompt } from '../services/jarvisAI';

export function useVoiceController({ onCommand } = {}) {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyBands, setFrequencyBands] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [transcript, setTranscript] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const isMicActiveRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const recognitionRef = useRef(null);
  const talkingTimeoutRef = useRef(null);
  const simulationIntervalRef = useRef(null);
  const smoothedLevelRef = useRef(0);

  // Keep isMicActiveRef in sync
  useEffect(() => {
    isMicActiveRef.current = isMicActive;
  }, [isMicActive]);

  // Voice synthesis feedback
  const speakResponse = useCallback((text) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        // Clean speech for TTS (remove markdown asterisks, bullet dots, etc.)
        const cleanSpeech = text.replace(/[*#`•]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        // Find best robotic / tech sounding English voice
        const voices = window.speechSynthesis.getVoices();
        const techVoice = voices.find(v => v.lang.includes('en') && (
          v.name.includes('David') || 
          v.name.includes('Daniel') || 
          v.name.includes('Google UK English Male') || 
          v.name.includes('Natural')
        ));
        if (techVoice) utterance.voice = techVoice;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }
  }, []);

  // Command detection & conversational query handling
  const parseVoiceCommand = useCallback(async (spokenText) => {
    const text = spokenText.toLowerCase().trim();
    if (!text) return;

    let recognized = null;

    // Fast-path greetings & system queries
    if (text.includes('hello jarvis') || text.includes('hi jarvis') || text.includes('hey jarvis') || text.includes('hello j.a.r.v.i.s') || text === 'jarvis' || text === 'hello') {
      recognized = { type: 'chat', message: 'Greetings, Chief Operator. All systems are operational and awaiting your instruction.' };
    } else if (text.includes('who are you') || text.includes('what is your name')) {
      recognized = { type: 'chat', message: 'I am J.A.R.V.I.S., your Just A Rather Very Intelligent System.' };
    } else if (text.includes('status') || text.includes('system status') || text.includes('how are you') || text.includes('report')) {
      recognized = { type: 'action', value: 'diag', message: 'Subsystems nominal. Core reactor stability is at 99.98%.' };
    } else if (text.includes('thank you') || text.includes('thanks jarvis') || text.includes('thanks')) {
      recognized = { type: 'chat', message: 'Always a pleasure to assist, sir.' };
    }
    // Overdrive Controls
    else if (text.includes('overdrive') || text.includes('maximum power') || text.includes('full power') || text.includes('engage overdrive')) {
      recognized = { type: 'overdrive', value: true, message: 'Neural Overdrive protocol initiated.' };
    } else if (text.includes('normal') || text.includes('disengage') || text.includes('standby') || text.includes('baseline') || text.includes('disable overdrive')) {
      recognized = { type: 'overdrive', value: false, message: 'Baseline power levels restored.' };
    }
    // Theme Calibration
    else if (text.includes('theme purple') || text.includes('quantum') || text.includes('purple')) {
      recognized = { type: 'theme', value: 'quantum', message: 'Theme calibrated to Quantum Purple.' };
    } else if (text.includes('theme amber') || text.includes('theme solar') || text.includes('solar') || text.includes('orange') || text.includes('gold')) {
      recognized = { type: 'theme', value: 'solar', message: 'Theme set to Solar Amber HUD.' };
    } else if (text.includes('theme green') || text.includes('theme emerald') || text.includes('emerald') || text.includes('matrix')) {
      recognized = { type: 'theme', value: 'emerald', message: 'Theme set to Emerald Matrix.' };
    } else if (text.includes('theme cyan') || text.includes('theme blue') || text.includes('blue') || text.includes('default theme') || text.includes('cyan')) {
      recognized = { type: 'theme', value: 'cyan', message: 'Theme restored to Cyan-01.' };
    }
    // Operational Actions
    else if (text.includes('scan') || text.includes('subspace') || text.includes('sweep')) {
      recognized = { type: 'action', value: 'scan', message: 'Neural subspace scan underway.' };
    } else if (text.includes('optimize') || text.includes('clean') || text.includes('boost') || text.includes('neural flux') || text.includes('flux')) {
      recognized = { type: 'action', value: 'optimize', message: 'Cache buffers purged and neural flux optimized.' };
    } else if (text.includes('diagnostic') || text.includes('diagnostics') || text.includes('health')) {
      recognized = { type: 'action', value: 'diag', message: 'Diagnostic routines executing across all clusters.' };
    } else if (text.includes('purge') || text.includes('clear memory')) {
      recognized = { type: 'action', value: 'purge', message: 'Memory heap buffer cleared.' };
    } else if (text.includes('calibrate') || text.includes('sensor')) {
      recognized = { type: 'action', value: 'calibrate', message: 'Sensor calibration verified against Earth magnetic field.' };
    } else if (text.includes('cluster') || text.includes('threads') || text.includes('rebalance')) {
      recognized = { type: 'action', value: 'cluster', message: 'Threads re-allocated evenly across cores.' };
    } else if (text.includes('grid on') || text.includes('enable grid')) {
      recognized = { type: 'grid', value: true, message: 'Holographic matrix grid enabled.' };
    } else if (text.includes('grid off') || text.includes('disable grid')) {
      recognized = { type: 'grid', value: false, message: 'Holographic matrix grid disabled.' };
    }

    if (recognized) {
      setLastAction(recognized.message);
      if (onCommand) {
        onCommand(recognized);
      }
      speakResponse(recognized.message);
    } else {
      // General question query via Neural AI
      try {
        const aiRes = await processJarvisPrompt(spokenText);
        if (aiRes && aiRes.reply) {
          setLastAction(aiRes.reply);
          speakResponse(aiRes.reply);
          if (aiRes.action && onCommand) {
            onCommand(aiRes.action);
          }
        }
      } catch (err) {
        console.warn('AI query for voice error:', err);
      }
    }
  }, [onCommand, speakResponse]);

  // Start Real Microphone Input & Speech Recognition
  const startListening = async () => {
    try {
      if (isSimulating) {
        stopSimulation();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsMicActive(true);
      isMicActiveRef.current = true;

      // Initialize Speech Recognition if supported
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            const piece = event.results[i][0].transcript;
            fullTranscript += piece + (event.results[i].isFinal ? ' ' : '');
          }

          const trimmed = fullTranscript.trim();
          if (trimmed) {
            setTranscript(trimmed);
            setIsTalking(true);
            if (talkingTimeoutRef.current) clearTimeout(talkingTimeoutRef.current);
            talkingTimeoutRef.current = setTimeout(() => {
              setIsTalking(false);
            }, 600);
          }

          // Process final phrases for commands
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const phrase = event.results[i][0].transcript;
              parseVoiceCommand(phrase);
            }
          }
        };

        recognition.onerror = (event) => {
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }
          console.warn('Speech recognition status:', event.error);
          if (event.error === 'not-allowed') {
            setTranscript('Microphone access blocked. Please allow mic permissions.');
          }
        };

        recognition.onend = () => {
          // Restart recognition if mic is still active
          if (isMicActiveRef.current) {
            setTimeout(() => {
              if (isMicActiveRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  // Ignore state error if already running
                }
              }
            }, 100);
          }
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('Recognition start error:', e);
        }
      } else {
        console.warn('Web Speech Recognition not supported in this browser.');
      }

      // Audio analysis loop for visual frequency bars and 3D plasma sphere
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const processAudio = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate RMS / overall volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 85); // 0.0 to 1.0

        // Smooth volume for aesthetic animation
        const currentSmooth = smoothedLevelRef.current;
        const target = normalized;
        const factor = target > currentSmooth ? 0.35 : 0.08;
        smoothedLevelRef.current = currentSmooth + (target - currentSmooth) * factor;

        setAudioLevel(smoothedLevelRef.current);

        // Sample 8 frequency bands
        const step = Math.floor(bufferLength / 8);
        const bands = [];
        for (let b = 0; b < 8; b++) {
          let bandSum = 0;
          for (let k = 0; k < step; k++) {
            bandSum += dataArray[b * step + k] || 0;
          }
          bands.push(Math.min(1, (bandSum / step) / 180));
        }
        setFrequencyBands(bands);

        // Talking detector threshold
        const talkingThreshold = 0.07;
        if (smoothedLevelRef.current > talkingThreshold) {
          setIsTalking(true);
          if (talkingTimeoutRef.current) clearTimeout(talkingTimeoutRef.current);
          talkingTimeoutRef.current = setTimeout(() => {
            setIsTalking(false);
          }, 350);
        }

        animFrameRef.current = requestAnimationFrame(processAudio);
      };

      processAudio();

    } catch (err) {
      console.error('Microphone access denied or error:', err);
      setIsMicActive(false);
      isMicActiveRef.current = false;
      // Fallback to simulation mode if mic fails
      toggleSimulation();
    }
  };

  // Stop Real Microphone Input
  const stopListening = () => {
    isMicActiveRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (talkingTimeoutRef.current) {
      clearTimeout(talkingTimeoutRef.current);
    }

    setIsMicActive(false);
    setIsTalking(false);
    setAudioLevel(0);
    smoothedLevelRef.current = 0;
    setFrequencyBands([0, 0, 0, 0, 0, 0, 0, 0]);
  };

  const toggleMic = () => {
    if (isMicActive) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Simulation mode (for hands-free demo or when no mic is available)
  const toggleSimulation = () => {
    if (isSimulating) {
      stopSimulation();
    } else {
      if (isMicActive) stopListening();
      setIsSimulating(true);
      setIsTalking(true);
      setTranscript('Simulating vocal command: "Jarvis, optimize neural flux..."');
      setLastAction('Optimizing neural flux and core cache buffers.');

      let step = 0;
      simulationIntervalRef.current = setInterval(() => {
        step += 0.08;
        const wave1 = Math.sin(step * 3.5) * 0.5 + 0.5;
        const wave2 = Math.sin(step * 7.2) * 0.3;
        const burst = Math.sin(step * 0.8) > 0.2 ? 1 : 0.15;
        const simLevel = Math.min(1, Math.max(0, (wave1 + wave2) * burst * 0.85));

        setAudioLevel(simLevel);
        setIsTalking(simLevel > 0.1);

        const bands = Array.from({ length: 8 }, (_, i) => {
          return Math.min(1, Math.max(0.05, simLevel * (0.6 + Math.sin(step * 4 + i) * 0.4)));
        });
        setFrequencyBands(bands);
      }, 30);
    }
  };

  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulating(false);
    setIsTalking(false);
    setAudioLevel(0);
    setFrequencyBands([0, 0, 0, 0, 0, 0, 0, 0]);
  };

  const simulateSinglePulse = (durationMs = 2500) => {
    if (isMicActive) return;
    setIsTalking(true);
    setTranscript('Simulating vocal command: "Jarvis, run full diagnostic..."');
    setLastAction('Diagnostic routines executing across all clusters.');

    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > durationMs) {
        clearInterval(interval);
        setIsTalking(false);
        setAudioLevel(0);
        setFrequencyBands([0, 0, 0, 0, 0, 0, 0, 0]);
        return;
      }
      const progress = elapsed / durationMs;
      const envelope = Math.sin(progress * Math.PI);
      const randomJitter = Math.random() * 0.3;
      const level = Math.min(1, envelope * (0.7 + randomJitter));
      setAudioLevel(level);
      setFrequencyBands(Array.from({ length: 8 }, () => Math.min(1, level * (0.5 + Math.random() * 0.5))));
    }, 30);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSimulation();
    };
  }, []);

  return {
    isMicActive,
    isTalking,
    audioLevel,
    frequencyBands,
    transcript,
    lastAction,
    isSimulating,
    toggleMic,
    startListening,
    stopListening,
    toggleSimulation,
    simulateSinglePulse,
    speakResponse,
  };
}

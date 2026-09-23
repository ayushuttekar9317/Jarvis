import React, { useEffect, useRef } from 'react';

export default function NeuralVisualizer({ isAnalyzing = false, theme = 'cyan' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let phase = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Color mapping
      let strokeColor = 'rgba(0, 229, 255, 0.7)';
      let glowColor = 'rgba(0, 229, 255, 0.3)';
      if (theme === 'quantum') {
        strokeColor = 'rgba(192, 132, 252, 0.7)';
        glowColor = 'rgba(192, 132, 252, 0.3)';
      } else if (theme === 'solar') {
        strokeColor = 'rgba(245, 158, 11, 0.7)';
        glowColor = 'rgba(245, 158, 11, 0.3)';
      } else if (theme === 'emerald') {
        strokeColor = 'rgba(16, 185, 129, 0.7)';
        glowColor = 'rgba(16, 185, 129, 0.3)';
      }

      const centerY = height / 2;
      const speed = isAnalyzing ? 0.08 : 0.03;
      phase += speed;

      // Draw multi-layered glowing sine waves
      const waves = [
        { amplitude: isAnalyzing ? 28 : 14, frequency: 0.02, alpha: 0.8, offset: 0 },
        { amplitude: isAnalyzing ? 20 : 10, frequency: 0.035, alpha: 0.5, offset: 1.2 },
        { amplitude: isAnalyzing ? 15 : 6, frequency: 0.015, alpha: 0.3, offset: 2.4 }
      ];

      waves.forEach(w => {
        ctx.beginPath();
        ctx.strokeStyle = strokeColor.replace('0.7', String(w.alpha));
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = glowColor;

        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * w.frequency + phase + w.offset) * w.amplitude * Math.sin((x / width) * Math.PI);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Draw center active nodes
      const numNodes = isAnalyzing ? 8 : 5;
      for (let i = 0; i < numNodes; i++) {
        const x = (width / (numNodes + 1)) * (i + 1);
        const y = centerY + Math.sin(x * 0.02 + phase) * (isAnalyzing ? 25 : 12) * Math.sin((x / width) * Math.PI);
        ctx.beginPath();
        ctx.arc(x, y, isAnalyzing ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = strokeColor;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAnalyzing, theme]);

  return (
    <div className="visualizer-container">
      <canvas ref={canvasRef} className="visualizer-canvas" />
    </div>
  );
}

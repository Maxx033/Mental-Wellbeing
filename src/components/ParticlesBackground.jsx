import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Ambient floating particles background –
 * soft glowing orbs that drift lazily for a calming effect.
 */
export default function ParticlesBackground() {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(devicePixelRatio, devicePixelRatio);
      setDimensions({ w, h });
    }

    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const count = Math.min(35, Math.floor(window.innerWidth / 50));
    const colors = [
      'rgba(134,163,151,0.12)',
      'rgba(154,190,165,0.10)',
      'rgba(99,119,193,0.08)',
      'rgba(138,153,208,0.09)',
      'rgba(184,209,191,0.11)',
    ];

    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 60 + 20,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
    }));

    function animate() {
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.x += p.dx;
        p.y += p.dy;
        p.phase += 0.003;

        // Wrap around
        if (p.x < -p.r) p.x = w + p.r;
        if (p.x > w + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = h + p.r;
        if (p.y > h + p.r) p.y = -p.r;

        const pulseFactor = 0.85 + Math.sin(p.phase) * 0.15;
        const radius = p.r * pulseFactor;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
